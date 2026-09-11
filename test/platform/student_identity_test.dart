import 'package:flutter_test/flutter_test.dart';
import 'package:unix/platform/identity/student_identity.dart';

void main() {
  final createdAt = DateTime.utc(2026, 9, 11, 9);

  Institution institution({bool active = true, String id = 'htw-dresden'}) =>
      Institution(
        id: id,
        name: 'HTW Dresden',
        countryCode: 'de',
        active: active,
      );

  PrivateAccount account({
    AccountStatus status = AccountStatus.active,
    String id = 'account-1',
  }) => PrivateAccount(
    id: id,
    email: ' Taylan@Example.de ',
    status: status,
    createdAt: createdAt,
  );

  CampusMembership membership({
    MembershipStatus status = MembershipStatus.verified,
    String accountId = 'account-1',
    String institutionId = 'htw-dresden',
  }) => CampusMembership(
    id: 'membership-1',
    accountId: accountId,
    institutionId: institutionId,
    status: status,
    requestedAt: createdAt,
    verifiedAt: status == MembershipStatus.verified
        ? createdAt.add(const Duration(minutes: 5))
        : null,
  );

  PublicStudentProfile profile({
    String accountId = 'account-1',
    String institutionId = 'htw-dresden',
    List<String> skills = const ['Excel', 'Statistik'],
  }) => PublicStudentProfile(
    id: 'profile-1',
    accountId: accountId,
    institutionId: institutionId,
    displayName: ' Taylan ',
    program: ' Wirtschaftsinformatik ',
    semester: ' 3. Semester ',
    bio: ' Hilft gern bei Tabellen. ',
    skills: skills,
    audience: ProfileAudience.university,
    updatedAt: createdAt,
  );

  StudentIdentity identity({
    AccountStatus accountStatus = AccountStatus.active,
    MembershipStatus membershipStatus = MembershipStatus.verified,
    bool institutionActive = true,
  }) => StudentIdentity(
    account: account(status: accountStatus),
    institution: institution(active: institutionActive),
    membership: membership(status: membershipStatus),
    profile: profile(),
  );

  group('platform identity', () {
    test('normalizes private and public fields', () {
      expect(account().email, 'taylan@example.de');
      expect(institution().countryCode, 'DE');
      expect(profile().displayName, 'Taylan');
      expect(profile().skills, ['Excel', 'Statistik']);
    });

    test('allows community use only for an active verified identity', () {
      expect(identity().canUseCommunity, isTrue);
      expect(
        identity(accountStatus: AccountStatus.suspended).canUseCommunity,
        isFalse,
      );
      expect(
        identity(membershipStatus: MembershipStatus.pending).canUseCommunity,
        isFalse,
      );
      expect(identity(institutionActive: false).canUseCommunity, isFalse);
    });

    test('round-trips the complete identity contract', () {
      final source = identity();
      final restored = StudentIdentity.fromJson(source.toJson());
      expect(restored.account.email, 'taylan@example.de');
      expect(restored.membership.status, MembershipStatus.verified);
      expect(restored.profile.bio, 'Hilft gern bei Tabellen.');
      expect(restored.canUseCommunity, isTrue);
    });

    test('keeps credentials and tokens outside serialization', () {
      final keys = identity().toJson().toString().toLowerCase();
      expect(keys, isNot(contains('password')));
      expect(keys, isNot(contains('token')));
      expect(keys, isNot(contains('secret')));
    });

    test('rejects malformed email addresses', () {
      expect(
        () => PrivateAccount(
          id: 'account-1',
          email: 'not-an-email',
          status: AccountStatus.active,
          createdAt: createdAt,
        ),
        throwsFormatException,
      );
    });

    test('rejects local timestamps at the platform boundary', () {
      expect(
        () => account().toJson()..['createdAt'] = '2026-09-11T09:00:00',
        returnsNormally,
      );
      final map = account().toJson()..['createdAt'] = '2026-09-11T09:00:00';
      expect(() => PrivateAccount.fromJson(map), throwsFormatException);
    });

    test('rejects impossible UTC calendar dates', () {
      final map = account().toJson()..['createdAt'] = '2026-02-31T09:00:00Z';
      expect(() => PrivateAccount.fromJson(map), throwsFormatException);
    });

    test('rejects invalid verification timestamps', () {
      expect(
        () => CampusMembership(
          id: 'membership-1',
          accountId: 'account-1',
          institutionId: 'htw-dresden',
          status: MembershipStatus.verified,
          requestedAt: createdAt,
        ),
        throwsFormatException,
      );
      expect(
        () => CampusMembership(
          id: 'membership-1',
          accountId: 'account-1',
          institutionId: 'htw-dresden',
          status: MembershipStatus.pending,
          requestedAt: createdAt,
          verifiedAt: createdAt,
        ),
        throwsFormatException,
      );
    });

    test('rejects duplicate skills without case sensitivity', () {
      expect(
        () => profile(skills: const ['Excel', 'excel']),
        throwsFormatException,
      );
    });

    test('rejects more than ten skills', () {
      expect(
        () => profile(skills: [for (var i = 0; i < 11; i++) 'Skill $i']),
        throwsFormatException,
      );
    });

    test('rejects identities with mismatched account references', () {
      expect(
        () => StudentIdentity(
          account: account(),
          institution: institution(),
          membership: membership(accountId: 'account-2'),
          profile: profile(),
        ),
        throwsFormatException,
      );
    });

    test('rejects identities with mismatched institution references', () {
      expect(
        () => StudentIdentity(
          account: account(),
          institution: institution(),
          membership: membership(),
          profile: profile(institutionId: 'another-university'),
        ),
        throwsFormatException,
      );
    });
  });
}
