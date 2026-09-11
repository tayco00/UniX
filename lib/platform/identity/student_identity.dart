enum AccountStatus { pendingVerification, active, suspended, closed }

enum MembershipStatus { unverified, pending, verified, rejected, expired }

enum ProfileAudience { university, connections }

class Institution {
  Institution({
    required String id,
    required String name,
    required String countryCode,
    required this.active,
  }) : id = _required(id, 'institution.id', 100),
       name = _required(name, 'institution.name', 160),
       countryCode = _countryCode(countryCode);

  final String id;
  final String name;
  final String countryCode;
  final bool active;

  Map<String, Object> toJson() => {
    'id': id,
    'name': name,
    'countryCode': countryCode,
    'active': active,
  };

  factory Institution.fromJson(Object? source) {
    final map = _map(source, 'institution');
    return Institution(
      id: _text(map, 'id', 100, required: true),
      name: _text(map, 'name', 160, required: true),
      countryCode: _text(map, 'countryCode', 2, required: true),
      active: _boolean(map, 'active'),
    );
  }
}

class PrivateAccount {
  PrivateAccount({
    required String id,
    required String email,
    required this.status,
    required DateTime createdAt,
  }) : id = _required(id, 'account.id', 100),
       email = _email(email),
       createdAt = _utc(createdAt, 'account.createdAt');

  final String id;
  final String email;
  final AccountStatus status;
  final DateTime createdAt;

  Map<String, Object> toJson() => {
    'id': id,
    'email': email,
    'status': status.name,
    'createdAt': createdAt.toIso8601String(),
  };

  factory PrivateAccount.fromJson(Object? source) {
    final map = _map(source, 'account');
    return PrivateAccount(
      id: _text(map, 'id', 100, required: true),
      email: _text(map, 'email', 254, required: true),
      status: _enumValue(AccountStatus.values, map['status'], 'status'),
      createdAt: _date(map, 'createdAt'),
    );
  }
}

class CampusMembership {
  CampusMembership({
    required String id,
    required String accountId,
    required String institutionId,
    required this.status,
    required DateTime requestedAt,
    DateTime? verifiedAt,
  }) : id = _required(id, 'membership.id', 100),
       accountId = _required(accountId, 'membership.accountId', 100),
       institutionId = _required(
         institutionId,
         'membership.institutionId',
         100,
       ),
       requestedAt = _utc(requestedAt, 'membership.requestedAt'),
       verifiedAt = verifiedAt == null
           ? null
           : _utc(verifiedAt, 'membership.verifiedAt') {
    if (status == MembershipStatus.verified && this.verifiedAt == null) {
      throw const FormatException('Verified membership needs verifiedAt');
    }
    if (status != MembershipStatus.verified && this.verifiedAt != null) {
      throw const FormatException('Only verified membership has verifiedAt');
    }
    if (this.verifiedAt != null &&
        this.verifiedAt!.isBefore(this.requestedAt)) {
      throw const FormatException('Verification cannot predate request');
    }
  }

  final String id;
  final String accountId;
  final String institutionId;
  final MembershipStatus status;
  final DateTime requestedAt;
  final DateTime? verifiedAt;

  Map<String, Object?> toJson() => {
    'id': id,
    'accountId': accountId,
    'institutionId': institutionId,
    'status': status.name,
    'requestedAt': requestedAt.toIso8601String(),
    'verifiedAt': verifiedAt?.toIso8601String(),
  };

  factory CampusMembership.fromJson(Object? source) {
    final map = _map(source, 'membership');
    return CampusMembership(
      id: _text(map, 'id', 100, required: true),
      accountId: _text(map, 'accountId', 100, required: true),
      institutionId: _text(map, 'institutionId', 100, required: true),
      status: _enumValue(MembershipStatus.values, map['status'], 'status'),
      requestedAt: _date(map, 'requestedAt'),
      verifiedAt: _nullableDate(map, 'verifiedAt'),
    );
  }
}

class PublicStudentProfile {
  PublicStudentProfile({
    required String id,
    required String accountId,
    required String institutionId,
    required String displayName,
    required String program,
    required String semester,
    required String bio,
    required List<String> skills,
    required this.audience,
    required DateTime updatedAt,
  }) : id = _required(id, 'profile.id', 100),
       accountId = _required(accountId, 'profile.accountId', 100),
       institutionId = _required(institutionId, 'profile.institutionId', 100),
       displayName = _required(displayName, 'profile.displayName', 60),
       program = _required(program, 'profile.program', 120),
       semester = _optional(semester, 'profile.semester', 40),
       bio = _optional(bio, 'profile.bio', 280),
       skills = _skills(skills),
       updatedAt = _utc(updatedAt, 'profile.updatedAt');

  final String id;
  final String accountId;
  final String institutionId;
  final String displayName;
  final String program;
  final String semester;
  final String bio;
  final List<String> skills;
  final ProfileAudience audience;
  final DateTime updatedAt;

  Map<String, Object> toJson() => {
    'id': id,
    'accountId': accountId,
    'institutionId': institutionId,
    'displayName': displayName,
    'program': program,
    'semester': semester,
    'bio': bio,
    'skills': skills,
    'audience': audience.name,
    'updatedAt': updatedAt.toIso8601String(),
  };

  factory PublicStudentProfile.fromJson(Object? source) {
    final map = _map(source, 'profile');
    final rawSkills = map['skills'];
    if (rawSkills is! List || rawSkills.any((item) => item is! String)) {
      throw const FormatException('Invalid skills');
    }
    return PublicStudentProfile(
      id: _text(map, 'id', 100, required: true),
      accountId: _text(map, 'accountId', 100, required: true),
      institutionId: _text(map, 'institutionId', 100, required: true),
      displayName: _text(map, 'displayName', 60, required: true),
      program: _text(map, 'program', 120, required: true),
      semester: _text(map, 'semester', 40),
      bio: _text(map, 'bio', 280),
      skills: rawSkills.cast<String>(),
      audience: _enumValue(ProfileAudience.values, map['audience'], 'audience'),
      updatedAt: _date(map, 'updatedAt'),
    );
  }
}

class StudentIdentity {
  StudentIdentity({
    required this.account,
    required this.institution,
    required this.membership,
    required this.profile,
  }) {
    if (membership.accountId != account.id || profile.accountId != account.id) {
      throw const FormatException('Identity account references do not match');
    }
    if (membership.institutionId != institution.id ||
        profile.institutionId != institution.id) {
      throw const FormatException(
        'Identity institution references do not match',
      );
    }
  }

  final PrivateAccount account;
  final Institution institution;
  final CampusMembership membership;
  final PublicStudentProfile profile;

  bool get canUseCommunity =>
      account.status == AccountStatus.active &&
      institution.active &&
      membership.status == MembershipStatus.verified;

  Map<String, Object> toJson() => {
    'account': account.toJson(),
    'institution': institution.toJson(),
    'membership': membership.toJson(),
    'profile': profile.toJson(),
  };

  factory StudentIdentity.fromJson(Object? source) {
    final map = _map(source, 'identity');
    return StudentIdentity(
      account: PrivateAccount.fromJson(map['account']),
      institution: Institution.fromJson(map['institution']),
      membership: CampusMembership.fromJson(map['membership']),
      profile: PublicStudentProfile.fromJson(map['profile']),
    );
  }
}

Map<String, Object?> _map(Object? source, String field) {
  if (source is! Map) throw FormatException('Invalid $field');
  return source.map((key, value) => MapEntry(key.toString(), value));
}

String _text(
  Map<String, Object?> map,
  String key,
  int maximum, {
  bool required = false,
}) {
  final value = map[key];
  if (value is! String) throw FormatException('Invalid $key');
  return required
      ? _required(value, key, maximum)
      : _optional(value, key, maximum);
}

String _required(String source, String field, int maximum) {
  final value = _optional(source, field, maximum);
  if (value.isEmpty) throw FormatException('Invalid $field');
  return value;
}

String _optional(String source, String field, int maximum) {
  final value = source.trim();
  if (value.length > maximum) throw FormatException('Invalid $field');
  return value;
}

String _email(String source) {
  final value = _required(source, 'account.email', 254).toLowerCase();
  final pattern = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  if (!pattern.hasMatch(value)) throw const FormatException('Invalid email');
  return value;
}

String _countryCode(String source) {
  final value = source.trim().toUpperCase();
  if (!RegExp(r'^[A-Z]{2}$').hasMatch(value)) {
    throw const FormatException('Invalid countryCode');
  }
  return value;
}

List<String> _skills(List<String> source) {
  if (source.length > 10) throw const FormatException('Too many skills');
  final result = source
      .map((skill) => _required(skill, 'profile.skill', 40))
      .toList(growable: false);
  final normalized = result.map((skill) => skill.toLowerCase()).toSet();
  if (normalized.length != result.length) {
    throw const FormatException('Duplicate skills');
  }
  return List.unmodifiable(result);
}

bool _boolean(Map<String, Object?> map, String key) {
  final value = map[key];
  if (value is! bool) throw FormatException('Invalid $key');
  return value;
}

DateTime _utc(DateTime source, String field) {
  if (!source.isUtc) throw FormatException('$field must be UTC');
  return source;
}

DateTime _date(Map<String, Object?> map, String key) {
  final value = map[key];
  if (value is! String) {
    throw FormatException('Invalid $key');
  }
  final match = RegExp(
    r'^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?Z$',
  ).firstMatch(value);
  if (match == null) throw FormatException('Invalid $key');
  final parsed = DateTime.tryParse(value);
  if (parsed == null || !parsed.isUtc) throw FormatException('Invalid $key');
  final parts = [
    for (var index = 1; index <= 6; index++) int.parse(match.group(index)!),
  ];
  if (parsed.year != parts[0] ||
      parsed.month != parts[1] ||
      parsed.day != parts[2] ||
      parsed.hour != parts[3] ||
      parsed.minute != parts[4] ||
      parsed.second != parts[5]) {
    throw FormatException('Invalid $key');
  }
  return parsed;
}

DateTime? _nullableDate(Map<String, Object?> map, String key) {
  if (map[key] == null) return null;
  return _date(map, key);
}

T _enumValue<T extends Enum>(List<T> values, Object? source, String key) {
  if (source is! String) throw FormatException('Invalid $key');
  return values.firstWhere(
    (value) => value.name == source,
    orElse: () => throw FormatException('Invalid $key'),
  );
}
