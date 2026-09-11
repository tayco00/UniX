import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:unix/domain/workspace.dart';

import '../support/fakes.dart';

void main() {
  group('StudentProfile', () {
    test('requires the three onboarding fields', () {
      expect(const StudentProfile.empty().isComplete, isFalse);
      expect(completeProfile().isComplete, isTrue);
    });

    test('trims fields when serialized and restored', () {
      final restored = StudentProfile.fromJson(
        const StudentProfile(
          firstName: ' Taylan ',
          university: ' HTW ',
          program: ' Informatik ',
          semester: ' 3 ',
        ).toJson(),
      );
      expect(restored.firstName, 'Taylan');
      expect(restored.university, 'HTW');
      expect(restored.program, 'Informatik');
      expect(restored.semester, '3');
    });

    test('rejects oversized text', () {
      expect(
        () => StudentProfile.fromJson({
          'firstName': List.filled(81, 'a').join(),
          'university': 'HTW',
          'program': 'Informatik',
          'semester': '',
        }),
        throwsFormatException,
      );
    });
  });

  group('Workspace serialization', () {
    test('round-trips all product data', () {
      final source = readyWorkspace(
        modules: [module()],
        commitments: [
          commitment(
            kind: CommitmentKind.dining,
            priority: CommitmentPriority.high,
            notes: 'Vegetarisches Tagesgericht',
          ),
        ],
      );
      final restored = Workspace.decode(source.encode());
      expect(restored.profile.firstName, 'Taylan');
      expect(restored.modules.single.name, 'Statistik');
      expect(restored.commitments.single.kind, CommitmentKind.dining);
      expect(restored.commitments.single.priority, CommitmentPriority.high);
      expect(restored.encode(), source.encode());
    });

    test('round-trips UTC dates', () {
      final source = Workspace.empty(DateTime.utc(2026, 9, 11, 9, 2, 3, 4, 5));
      expect(Workspace.decode(source.encode()).updatedAt, source.updatedAt);
    });

    test('rejects malformed JSON', () {
      expect(() => Workspace.decode('{not-json}'), throwsFormatException);
    });

    test('rejects unsupported schemas', () {
      final map = readyWorkspace().toJson()..['schemaVersion'] = 2;
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });

    test('rejects completed setup without a profile', () {
      final map = Workspace.empty().toJson()..['setupComplete'] = true;
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });

    test('rejects duplicate module identifiers', () {
      final map = readyWorkspace(modules: [module(), module()]).toJson();
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });

    test('rejects duplicate commitment identifiers', () {
      final map = readyWorkspace(
        modules: [module()],
        commitments: [commitment(), commitment()],
      ).toJson();
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });

    test('rejects dangling module references', () {
      final map = readyWorkspace(commitments: [commitment(moduleId: 'missing')])
          .toJson();
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });

    test('rejects more than one hundred modules', () {
      final modules = [for (var i = 0; i < 101; i++) module(id: 'm-$i')];
      expect(
        () => Workspace.fromJson(readyWorkspace(modules: modules).toJson()),
        throwsFormatException,
      );
    });

    test('rejects more than five thousand commitments', () {
      final items = [
        for (var i = 0; i < 5001; i++) commitment(id: 'i-$i', moduleId: null),
      ];
      expect(
        () => Workspace.fromJson(readyWorkspace(commitments: items).toJson()),
        throwsFormatException,
      );
    });

    test('rejects an impossible calendar date instead of normalizing it', () {
      final map = jsonDecode(readyWorkspace().encode()) as Map<String, dynamic>;
      map['updatedAt'] = '2026-02-31T10:00:00.000';
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });

    test('rejects unsupported date offsets', () {
      final map = jsonDecode(readyWorkspace().encode()) as Map<String, dynamic>;
      map['updatedAt'] = '2026-09-11T10:00:00+02:00';
      expect(() => Workspace.fromJson(map), throwsFormatException);
    });
  });

  group('Commitment', () {
    test('can remove its module reference explicitly', () {
      expect(commitment().copyWith(clearModule: true).moduleId, isNull);
    });

    test('rejects durations outside the supported range', () {
      final map = commitment(moduleId: null).toJson()
        ..['durationMinutes'] = 1441;
      expect(() => Commitment.fromJson(map), throwsFormatException);
    });

    test('rejects unknown kinds', () {
      final map = commitment(moduleId: null).toJson()..['kind'] = 'invented';
      expect(() => Commitment.fromJson(map), throwsFormatException);
    });

    test('includes Mensa/Cafétaria as a first-class kind', () {
      expect(CommitmentKind.values, contains(CommitmentKind.dining));
    });
  });

  group('StudyModule', () {
    test('rejects a blank module name', () {
      final map = module().toJson()..['name'] = '   ';
      expect(() => StudyModule.fromJson(map), throwsFormatException);
    });

    test('rejects an oversized short name', () {
      final map = module().toJson()..['shortName'] = '1234567890123';
      expect(() => StudyModule.fromJson(map), throwsFormatException);
    });
  });
}
