import 'package:flutter_test/flutter_test.dart';
import 'package:unix/application/workspace_controller.dart';
import 'package:unix/domain/workspace.dart';

import '../support/fakes.dart';

void main() {
  final now = DateTime(2026, 9, 11, 10);

  group('initialization', () {
    test('loads the workspace', () async {
      final repository = MemoryWorkspaceRepository(initial: readyWorkspace());
      final controller = WorkspaceController(repository, now: () => now);
      await controller.initialize();
      expect(controller.loading, isFalse);
      expect(controller.workspace!.setupComplete, isTrue);
      expect(repository.loadCount, 1);
    });

    test('surfaces a recoverable startup failure', () async {
      final repository = MemoryWorkspaceRepository(
        loadError: StateError('disk'),
      );
      final controller = WorkspaceController(repository, now: () => now);
      await controller.initialize();
      expect(controller.workspace, isNull);
      expect(controller.error, contains('nicht öffnen'));
    });
  });

  group('mutations', () {
    late MemoryWorkspaceRepository repository;
    late WorkspaceController controller;

    setUp(() async {
      repository = MemoryWorkspaceRepository(initial: Workspace.empty(now));
      controller = WorkspaceController(repository, now: () => now);
      await controller.initialize();
    });

    test('completes onboarding and persists the profile', () async {
      expect(await controller.completeSetup(completeProfile()), isTrue);
      expect(controller.workspace!.setupComplete, isTrue);
      expect(repository.saveCount, 1);
    });

    test('does not accept an incomplete onboarding profile', () async {
      expect(
        await controller.completeSetup(const StudentProfile.empty()),
        isFalse,
      );
      expect(controller.workspace!.setupComplete, isFalse);
      expect(controller.error, isNotNull);
    });

    test('adds and updates a module without duplication', () async {
      await controller.saveModule(module());
      await controller.saveModule(module(name: 'Statistik II'));
      expect(controller.workspace!.modules, hasLength(1));
      expect(controller.workspace!.modules.single.name, 'Statistik II');
    });

    test('adds and updates a commitment without duplication', () async {
      await controller.saveModule(module());
      await controller.saveCommitment(commitment());
      await controller.saveCommitment(commitment(title: 'Neue Fassung'));
      expect(controller.workspace!.commitments, hasLength(1));
      expect(controller.workspace!.commitments.single.title, 'Neue Fassung');
    });

    test('keeps the previous state when persistence fails', () async {
      repository.saveError = StateError('full');
      expect(await controller.saveModule(module()), isFalse);
      expect(controller.workspace!.modules, isEmpty);
      expect(controller.error, contains('nicht gespeichert'));
    });

    test('toggles an existing commitment both ways', () async {
      await controller.saveModule(module());
      await controller.saveCommitment(commitment());
      await controller.toggleCommitment('item-1');
      expect(
        controller.workspace!.commitments.single.status,
        CommitmentStatus.done,
      );
      await controller.toggleCommitment('item-1');
      expect(
        controller.workspace!.commitments.single.status,
        CommitmentStatus.open,
      );
    });

    test('reports a stale toggle target', () async {
      expect(await controller.toggleCommitment('missing'), isFalse);
      expect(controller.error, contains('existiert nicht'));
    });

    test('deletes only the selected commitment', () async {
      await controller.saveCommitment(commitment(id: 'first', moduleId: null));
      await controller.saveCommitment(commitment(id: 'second', moduleId: null));
      expect(await controller.deleteCommitment('first'), isTrue);
      expect(controller.workspace!.commitments.single.id, 'second');
    });

    test('reports a stale delete target', () async {
      expect(await controller.deleteCommitment('missing'), isFalse);
      expect(controller.workspace!.commitments, isEmpty);
    });

    test('imports a valid backup atomically', () async {
      final backup = readyWorkspace(modules: [module()]).encode();
      expect(await controller.importJson(backup), isTrue);
      expect(controller.workspace!.modules.single.name, 'Statistik');
    });

    test('rejects an invalid backup and keeps current data', () async {
      await controller.completeSetup(completeProfile());
      expect(await controller.importJson('{}'), isFalse);
      expect(controller.workspace!.profile.firstName, 'Taylan');
    });

    test('resets repository and memory state', () async {
      await controller.completeSetup(completeProfile());
      expect(await controller.reset(), isTrue);
      expect(repository.clearCount, 1);
      expect(controller.workspace!.setupComplete, isFalse);
    });

    test('generates unique identifiers at the same clock instant', () {
      expect(controller.nextId('item'), isNot(controller.nextId('item')));
    });
  });

  group('planning queries', () {
    late WorkspaceController controller;

    setUp(() async {
      final modules = [module(), module(id: 'module-2', name: 'Datenbanken')];
      final items = [
        commitment(
          id: 'done',
          status: CommitmentStatus.done,
          dueAt: now.subtract(const Duration(days: 2)),
        ),
        commitment(id: 'later', dueAt: now.add(const Duration(days: 3))),
        commitment(
          id: 'urgent',
          priority: CommitmentPriority.high,
          dueAt: now.add(const Duration(days: 3)),
        ),
        commitment(
          id: 'overdue',
          title: 'SQL lernen',
          moduleId: 'module-2',
          notes: 'JOIN üben',
          dueAt: now.subtract(const Duration(hours: 1)),
        ),
      ];
      controller = WorkspaceController(
        MemoryWorkspaceRepository(
          initial: readyWorkspace(modules: modules, commitments: items),
        ),
        now: () => now,
      );
      await controller.initialize();
    });

    test('keeps open items ahead of completed ones', () {
      final sorted = controller.sortedCommitments();
      expect(sorted.last.id, 'done');
    });

    test('uses priority as a tie-breaker for the same due date', () {
      final sorted = controller.sortedCommitments(
        status: CommitmentStatus.open,
      );
      expect(
        sorted.indexWhere((item) => item.id == 'urgent'),
        lessThan(sorted.indexWhere((item) => item.id == 'later')),
      );
    });

    test('selects an overdue item as the next focus', () {
      expect(controller.nextFocus(now)!.id, 'overdue');
    });

    test('searches title, notes and module name case-insensitively', () {
      expect(controller.search('sql', null).single.id, 'overdue');
      expect(controller.search('JOIN', null).single.id, 'overdue');
      expect(controller.search('datenbanken', null).single.id, 'overdue');
    });

    test('filters by completion state', () {
      expect(controller.search('', CommitmentStatus.done).single.id, 'done');
    });

    test(
      'searches five thousand entries within the interaction budget',
      () async {
        final items = [
          for (var i = 0; i < 5000; i++)
            commitment(
              id: 'bulk-$i',
              title: i == 4321 ? 'Gesuchter Eintrag' : 'Eintrag $i',
              moduleId: null,
              dueAt: now.add(Duration(minutes: i)),
            ),
        ];
        final largeController = WorkspaceController(
          MemoryWorkspaceRepository(
            initial: readyWorkspace(commitments: items),
          ),
          now: () => now,
        );
        await largeController.initialize();
        final stopwatch = Stopwatch()..start();
        final result = largeController.search('gesuchter', null);
        stopwatch.stop();
        expect(result.single.id, 'bulk-4321');
        expect(stopwatch.elapsed, lessThan(const Duration(seconds: 1)));
      },
    );
  });
}
