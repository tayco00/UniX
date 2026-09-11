import 'package:flutter_test/flutter_test.dart';
import 'package:unix/platform/trust/trust_safety.dart';

void main() {
  final submittedAt = DateTime.utc(2026, 9, 11, 9);

  SafetyReport report({
    ReportCategory category = ReportCategory.spam,
    String details = '',
    ReportStatus status = ReportStatus.submitted,
  }) => SafetyReport(
    id: 'report-1',
    reporterAccountId: 'account-1',
    targetType: SafetyTargetType.gig,
    targetId: 'gig-1',
    category: category,
    details: details,
    status: status,
    submittedAt: submittedAt,
    updatedAt: submittedAt,
    revision: 0,
  );

  group('blocking', () {
    test('round-trips a block relation', () {
      final source = BlockRelation(
        id: 'block-1',
        actorAccountId: 'account-1',
        blockedAccountId: 'account-2',
        createdAt: submittedAt,
      );
      final restored = BlockRelation.fromJson(source.toJson());
      expect(restored.actorAccountId, 'account-1');
      expect(restored.blockedAccountId, 'account-2');
    });

    test('rejects self-blocking', () {
      expect(
        () => BlockRelation(
          id: 'block-1',
          actorAccountId: 'account-1',
          blockedAccountId: 'account-1',
          createdAt: submittedAt,
        ),
        throwsFormatException,
      );
    });
  });

  group('safety reports', () {
    test('round-trips a validated report', () {
      final restored = SafetyReport.fromJson(
        report(details: ' Wiederholte Werbung ').toJson(),
      );
      expect(restored.details, 'Wiederholte Werbung');
      expect(restored.revision, 0);
    });

    test('requires details for the other category', () {
      expect(
        () => report(category: ReportCategory.other),
        throwsFormatException,
      );
    });

    test('moves through review with a monotonic revision', () {
      final reviewing = report().transitionTo(
        ReportStatus.reviewing,
        submittedAt.add(const Duration(minutes: 2)),
      );
      final resolved = reviewing.transitionTo(
        ReportStatus.resolved,
        submittedAt.add(const Duration(minutes: 4)),
      );
      expect(reviewing.revision, 1);
      expect(resolved.revision, 2);
      expect(resolved.status, ReportStatus.resolved);
    });

    test('does not skip the review state', () {
      expect(
        () => report().transitionTo(ReportStatus.resolved, submittedAt),
        throwsStateError,
      );
    });

    test('does not reopen a terminal report', () {
      final dismissed = report().transitionTo(
        ReportStatus.dismissed,
        submittedAt,
      );
      expect(
        () => dismissed.transitionTo(
          ReportStatus.reviewing,
          submittedAt.add(const Duration(minutes: 1)),
        ),
        throwsStateError,
      );
    });

    test('rejects timestamps moving backwards', () {
      expect(
        () => report().transitionTo(
          ReportStatus.reviewing,
          submittedAt.subtract(const Duration(seconds: 1)),
        ),
        throwsFormatException,
      );
    });

    test('rejects oversized report details', () {
      expect(
        () => report(details: List.filled(1001, 'a').join()),
        throwsFormatException,
      );
    });
  });
}
