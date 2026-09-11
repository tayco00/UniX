import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:unix/app/unix_app.dart';
import 'package:unix/application/workspace_controller.dart';

import '../support/fakes.dart';

Future<void> pumpApp(
  WidgetTester tester, {
  MemoryWorkspaceRepository? repository,
  FakeHostBridge? host,
  Size size = const Size(1200, 900),
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final controller = WorkspaceController(
    repository ?? MemoryWorkspaceRepository(),
    now: () => DateTime(2026, 9, 11, 10),
  );
  await tester.pumpWidget(
    UnixApp(controller: controller, hostBridge: host ?? FakeHostBridge()),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('first launch has a clear onboarding form', (tester) async {
    await pumpApp(tester);
    expect(find.text('Richte UniX für dich ein.'), findsOneWidget);
    expect(find.text('Vorname'), findsOneWidget);
    expect(find.text('Hochschule'), findsOneWidget);
    expect(find.text('Studiengang'), findsOneWidget);
    expect(find.text('Semester (optional)'), findsOneWidget);
  });

  testWidgets('onboarding explains missing required fields', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.byKey(const Key('onboarding-submit')));
    await tester.pump();
    expect(find.text('Bitte ausfüllen.'), findsNWidgets(3));
  });

  testWidgets('a person can finish onboarding and reach the empty plan', (
    tester,
  ) async {
    await pumpApp(tester);
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'Taylan');
    await tester.enterText(fields.at(1), 'HTW Dresden');
    await tester.enterText(fields.at(2), 'Wirtschaftsinformatik');
    await tester.tap(find.byKey(const Key('onboarding-submit')));
    await tester.pumpAndSettle();
    expect(find.textContaining('Taylan.'), findsOneWidget);
    expect(find.text('Dein Plan beginnt mit einem Eintrag.'), findsOneWidget);
  });

  testWidgets('desktop uses sidebar navigation', (tester) async {
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(initial: readyWorkspace()),
      size: const Size(1440, 900),
    );
    expect(find.byType(NavigationBar), findsNothing);
    expect(find.text('Heute'), findsOneWidget);
    expect(find.text('Planer'), findsOneWidget);
    expect(find.text('Module'), findsOneWidget);
  });

  testWidgets('mobile uses bottom navigation without horizontal overflow', (
    tester,
  ) async {
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(initial: readyWorkspace()),
      size: const Size(390, 844),
    );
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('a module can be created through the interface', (tester) async {
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(initial: readyWorkspace()),
    );
    await tester.tap(find.text('Module'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Erstes Modul anlegen'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('module-name')), 'Statistik');
    final editorFields = find.descendant(
      of: find.byType(Dialog),
      matching: find.byType(TextFormField),
    );
    await tester.enterText(editorFields.at(1), 'STAT');
    await tester.tap(find.byKey(const Key('module-save')));
    await tester.pumpAndSettle();
    expect(find.text('Statistik'), findsOneWidget);
    expect(find.text('0 offene Verpflichtungen'), findsOneWidget);
  });

  testWidgets('the commitment kind menu contains Mensa/Cafétaria', (
    tester,
  ) async {
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(initial: readyWorkspace()),
    );
    await tester.tap(find.byKey(const Key('home-add')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('commitment-kind')));
    await tester.pumpAndSettle();
    expect(find.text('Mensa/Cafétaria'), findsOneWidget);
  });

  testWidgets('an entry can be created and completed through the interface', (
    tester,
  ) async {
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(initial: readyWorkspace()),
    );
    await tester.tap(find.byKey(const Key('home-add')));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const Key('commitment-title')),
      'Prüfung vorbereiten',
    );
    await tester.tap(find.byKey(const Key('commitment-save')));
    await tester.pumpAndSettle();
    expect(find.text('Prüfung vorbereiten'), findsOneWidget);
    await tester.tap(find.byTooltip('Als erledigt markieren'));
    await tester.pumpAndSettle();
    expect(find.text('Alles erledigt.'), findsOneWidget);
  });

  testWidgets('unsaved editor input asks before it is discarded', (
    tester,
  ) async {
    final host = FakeHostBridge();
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(initial: readyWorkspace()),
      host: host,
    );
    await tester.tap(find.byKey(const Key('home-add')));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const Key('commitment-title')),
      'Prüfung vorbereiten',
    );
    expect(host.dirty, isTrue);
    await tester.tap(find.byTooltip('Schließen'));
    await tester.pumpAndSettle();
    expect(find.text('Eingaben verwerfen?'), findsOneWidget);
    expect(find.text('Weiter bearbeiten'), findsOneWidget);
  });

  testWidgets('startup errors offer an explicit retry', (tester) async {
    await pumpApp(
      tester,
      repository: MemoryWorkspaceRepository(loadError: StateError('disk')),
    );
    expect(find.text('UniX konnte nicht starten.'), findsOneWidget);
    expect(find.text('Erneut versuchen'), findsOneWidget);
  });
}
