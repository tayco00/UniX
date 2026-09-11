import 'dart:convert';

enum CommitmentKind { exam, submission, study, organization, dining }

enum CommitmentPriority { normal, high }

enum CommitmentStatus { open, done }

enum ModuleTone { blue, mint, violet, coral, amber }

class StudentProfile {
  const StudentProfile({
    required this.firstName,
    required this.university,
    required this.program,
    required this.semester,
  });

  const StudentProfile.empty()
    : firstName = '',
      university = '',
      program = '',
      semester = '';

  final String firstName;
  final String university;
  final String program;
  final String semester;

  bool get isComplete =>
      firstName.trim().isNotEmpty &&
      university.trim().isNotEmpty &&
      program.trim().isNotEmpty;

  Map<String, Object> toJson() => {
    'firstName': firstName.trim(),
    'university': university.trim(),
    'program': program.trim(),
    'semester': semester.trim(),
  };

  factory StudentProfile.fromJson(Object? source) {
    final map = _map(source, 'profile');
    return StudentProfile(
      firstName: _text(map, 'firstName', 80),
      university: _text(map, 'university', 120),
      program: _text(map, 'program', 120),
      semester: _text(map, 'semester', 40),
    );
  }
}

class StudyModule {
  const StudyModule({
    required this.id,
    required this.name,
    required this.shortName,
    required this.tone,
    required this.archived,
  });

  final String id;
  final String name;
  final String shortName;
  final ModuleTone tone;
  final bool archived;

  StudyModule copyWith({
    String? name,
    String? shortName,
    ModuleTone? tone,
    bool? archived,
  }) => StudyModule(
    id: id,
    name: name ?? this.name,
    shortName: shortName ?? this.shortName,
    tone: tone ?? this.tone,
    archived: archived ?? this.archived,
  );

  Map<String, Object> toJson() => {
    'id': id,
    'name': name.trim(),
    'shortName': shortName.trim(),
    'tone': tone.name,
    'archived': archived,
  };

  factory StudyModule.fromJson(Object? source) {
    final map = _map(source, 'module');
    return StudyModule(
      id: _requiredText(map, 'id', 100),
      name: _requiredText(map, 'name', 100),
      shortName: _requiredText(map, 'shortName', 12),
      tone: _enumValue(ModuleTone.values, map['tone'], 'tone'),
      archived: _boolean(map, 'archived'),
    );
  }
}

class Commitment {
  const Commitment({
    required this.id,
    required this.title,
    required this.moduleId,
    required this.kind,
    required this.dueAt,
    required this.durationMinutes,
    required this.priority,
    required this.status,
    required this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String title;
  final String? moduleId;
  final CommitmentKind kind;
  final DateTime dueAt;
  final int durationMinutes;
  final CommitmentPriority priority;
  final CommitmentStatus status;
  final String notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Commitment copyWith({
    String? title,
    String? moduleId,
    bool clearModule = false,
    CommitmentKind? kind,
    DateTime? dueAt,
    int? durationMinutes,
    CommitmentPriority? priority,
    CommitmentStatus? status,
    String? notes,
    DateTime? updatedAt,
  }) => Commitment(
    id: id,
    title: title ?? this.title,
    moduleId: clearModule ? null : moduleId ?? this.moduleId,
    kind: kind ?? this.kind,
    dueAt: dueAt ?? this.dueAt,
    durationMinutes: durationMinutes ?? this.durationMinutes,
    priority: priority ?? this.priority,
    status: status ?? this.status,
    notes: notes ?? this.notes,
    createdAt: createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );

  Map<String, Object?> toJson() => {
    'id': id,
    'title': title.trim(),
    'moduleId': moduleId,
    'kind': kind.name,
    'dueAt': dueAt.toIso8601String(),
    'durationMinutes': durationMinutes,
    'priority': priority.name,
    'status': status.name,
    'notes': notes.trim(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  factory Commitment.fromJson(Object? source) {
    final map = _map(source, 'commitment');
    final module = map['moduleId'];
    if (module != null &&
        (module is! String || module.isEmpty || module.length > 100)) {
      throw const FormatException('Invalid moduleId');
    }
    final duration = map['durationMinutes'];
    if (duration is! int || duration < 0 || duration > 1440) {
      throw const FormatException('Invalid duration');
    }
    return Commitment(
      id: _requiredText(map, 'id', 100),
      title: _requiredText(map, 'title', 140),
      moduleId: module as String?,
      kind: _enumValue(CommitmentKind.values, map['kind'], 'kind'),
      dueAt: _date(map, 'dueAt'),
      durationMinutes: duration,
      priority: _enumValue(
        CommitmentPriority.values,
        map['priority'],
        'priority',
      ),
      status: _enumValue(CommitmentStatus.values, map['status'], 'status'),
      notes: _text(map, 'notes', 2000),
      createdAt: _date(map, 'createdAt'),
      updatedAt: _date(map, 'updatedAt'),
    );
  }
}

class Workspace {
  const Workspace({
    required this.schemaVersion,
    required this.setupComplete,
    required this.profile,
    required this.modules,
    required this.commitments,
    required this.updatedAt,
  });

  factory Workspace.empty([DateTime? now]) => Workspace(
    schemaVersion: 1,
    setupComplete: false,
    profile: const StudentProfile.empty(),
    modules: const [],
    commitments: const [],
    updatedAt: now ?? DateTime.now(),
  );

  final int schemaVersion;
  final bool setupComplete;
  final StudentProfile profile;
  final List<StudyModule> modules;
  final List<Commitment> commitments;
  final DateTime updatedAt;

  Workspace copyWith({
    bool? setupComplete,
    StudentProfile? profile,
    List<StudyModule>? modules,
    List<Commitment>? commitments,
    DateTime? updatedAt,
  }) => Workspace(
    schemaVersion: 1,
    setupComplete: setupComplete ?? this.setupComplete,
    profile: profile ?? this.profile,
    modules: List.unmodifiable(modules ?? this.modules),
    commitments: List.unmodifiable(commitments ?? this.commitments),
    updatedAt: updatedAt ?? this.updatedAt,
  );

  Map<String, Object> toJson() => {
    'schemaVersion': schemaVersion,
    'setupComplete': setupComplete,
    'profile': profile.toJson(),
    'modules': modules.map((module) => module.toJson()).toList(),
    'commitments': commitments.map((item) => item.toJson()).toList(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  String encode() => jsonEncode(toJson());

  factory Workspace.decode(String source) =>
      Workspace.fromJson(jsonDecode(source));

  factory Workspace.fromJson(Object? source) {
    final map = _map(source, 'workspace');
    if (map['schemaVersion'] != 1 || map['setupComplete'] is! bool) {
      throw const FormatException('Unsupported workspace');
    }
    final rawModules = map['modules'];
    final rawCommitments = map['commitments'];
    if (rawModules is! List || rawModules.length > 100) {
      throw const FormatException('Invalid modules');
    }
    if (rawCommitments is! List || rawCommitments.length > 5000) {
      throw const FormatException('Invalid commitments');
    }
    final modules = rawModules
        .map(StudyModule.fromJson)
        .toList(growable: false);
    final commitments = rawCommitments
        .map(Commitment.fromJson)
        .toList(growable: false);
    final moduleIds = modules.map((module) => module.id).toSet();
    if (moduleIds.length != modules.length ||
        commitments.map((item) => item.id).toSet().length !=
            commitments.length ||
        commitments.any(
          (item) => item.moduleId != null && !moduleIds.contains(item.moduleId),
        )) {
      throw const FormatException('Invalid references');
    }
    final profile = StudentProfile.fromJson(map['profile']);
    if (map['setupComplete'] == true && !profile.isComplete) {
      throw const FormatException('Incomplete profile');
    }
    return Workspace(
      schemaVersion: 1,
      setupComplete: map['setupComplete'] as bool,
      profile: profile,
      modules: List.unmodifiable(modules),
      commitments: List.unmodifiable(commitments),
      updatedAt: _date(map, 'updatedAt'),
    );
  }
}

Map<String, Object?> _map(Object? value, String field) {
  if (value is! Map) throw FormatException('Invalid $field');
  return value.map((key, item) => MapEntry(key.toString(), item));
}

String _text(Map<String, Object?> map, String key, int maximum) {
  final value = map[key];
  if (value is! String || value.length > maximum) {
    throw FormatException('Invalid $key');
  }
  return value.trim();
}

String _requiredText(Map<String, Object?> map, String key, int maximum) {
  final value = _text(map, key, maximum);
  if (value.isEmpty) throw FormatException('Invalid $key');
  return value;
}

bool _boolean(Map<String, Object?> map, String key) {
  final value = map[key];
  if (value is! bool) throw FormatException('Invalid $key');
  return value;
}

DateTime _date(Map<String, Object?> map, String key) {
  final value = map[key];
  if (value is! String) throw FormatException('Invalid $key');
  final match = RegExp(
    r'^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z)?$',
  ).firstMatch(value);
  if (match == null) throw FormatException('Invalid $key');
  final parts = [
    for (var index = 1; index <= 6; index++) int.parse(match.group(index)!),
  ];
  final fraction = (match.group(7) ?? '').padRight(6, '0');
  final milliseconds = fraction.isEmpty
      ? 0
      : int.parse(fraction.substring(0, 3));
  final microseconds = fraction.isEmpty
      ? 0
      : int.parse(fraction.substring(3, 6));
  final isUtc = match.group(8) == 'Z';
  final date = isUtc
      ? DateTime.utc(
          parts[0],
          parts[1],
          parts[2],
          parts[3],
          parts[4],
          parts[5],
          milliseconds,
          microseconds,
        )
      : DateTime(
          parts[0],
          parts[1],
          parts[2],
          parts[3],
          parts[4],
          parts[5],
          milliseconds,
          microseconds,
        );
  if (date.year != parts[0] ||
      date.month != parts[1] ||
      date.day != parts[2] ||
      date.hour != parts[3] ||
      date.minute != parts[4] ||
      date.second != parts[5]) {
    throw FormatException('Invalid $key');
  }
  return date;
}

T _enumValue<T extends Enum>(List<T> values, Object? source, String key) {
  if (source is! String) throw FormatException('Invalid $key');
  return values.firstWhere(
    (value) => value.name == source,
    orElse: () => throw FormatException('Invalid $key'),
  );
}
