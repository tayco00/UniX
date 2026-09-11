enum SafetyTargetType { profile, gig, listing, message }

enum ReportCategory { spam, scam, harassment, unsafe, prohibited, other }

enum ReportStatus { submitted, reviewing, resolved, dismissed }

class BlockRelation {
  BlockRelation({
    required String id,
    required String actorAccountId,
    required String blockedAccountId,
    required DateTime createdAt,
  }) : id = _required(id, 'block.id', 100),
       actorAccountId = _required(actorAccountId, 'block.actorAccountId', 100),
       blockedAccountId = _required(
         blockedAccountId,
         'block.blockedAccountId',
         100,
       ),
       createdAt = _utc(createdAt, 'block.createdAt') {
    if (this.actorAccountId == this.blockedAccountId) {
      throw const FormatException('An account cannot block itself');
    }
  }

  final String id;
  final String actorAccountId;
  final String blockedAccountId;
  final DateTime createdAt;

  Map<String, Object> toJson() => {
    'id': id,
    'actorAccountId': actorAccountId,
    'blockedAccountId': blockedAccountId,
    'createdAt': createdAt.toIso8601String(),
  };

  factory BlockRelation.fromJson(Object? source) {
    final map = _map(source, 'block');
    return BlockRelation(
      id: _text(map, 'id', 100, required: true),
      actorAccountId: _text(map, 'actorAccountId', 100, required: true),
      blockedAccountId: _text(map, 'blockedAccountId', 100, required: true),
      createdAt: _date(map, 'createdAt'),
    );
  }
}

class SafetyReport {
  SafetyReport({
    required String id,
    required String reporterAccountId,
    required this.targetType,
    required String targetId,
    required this.category,
    required String details,
    required this.status,
    required DateTime submittedAt,
    required DateTime updatedAt,
    required this.revision,
  }) : id = _required(id, 'report.id', 100),
       reporterAccountId = _required(
         reporterAccountId,
         'report.reporterAccountId',
         100,
       ),
       targetId = _required(targetId, 'report.targetId', 100),
       details = _optional(details, 'report.details', 1000),
       submittedAt = _utc(submittedAt, 'report.submittedAt'),
       updatedAt = _utc(updatedAt, 'report.updatedAt') {
    if (category == ReportCategory.other && this.details.isEmpty) {
      throw const FormatException('Other reports need details');
    }
    if (revision < 0) throw const FormatException('Invalid report revision');
    if (this.updatedAt.isBefore(this.submittedAt)) {
      throw const FormatException('Report update cannot predate submission');
    }
  }

  final String id;
  final String reporterAccountId;
  final SafetyTargetType targetType;
  final String targetId;
  final ReportCategory category;
  final String details;
  final ReportStatus status;
  final DateTime submittedAt;
  final DateTime updatedAt;
  final int revision;

  SafetyReport transitionTo(ReportStatus next, DateTime now) {
    const allowed = {
      ReportStatus.submitted: {ReportStatus.reviewing, ReportStatus.dismissed},
      ReportStatus.reviewing: {ReportStatus.resolved, ReportStatus.dismissed},
      ReportStatus.resolved: <ReportStatus>{},
      ReportStatus.dismissed: <ReportStatus>{},
    };
    if (!allowed[status]!.contains(next)) {
      throw StateError(
        'Invalid report transition: ${status.name} -> ${next.name}',
      );
    }
    final changedAt = _utc(now, 'report.updatedAt');
    if (changedAt.isBefore(updatedAt)) {
      throw const FormatException('Report update cannot move backwards');
    }
    return SafetyReport(
      id: id,
      reporterAccountId: reporterAccountId,
      targetType: targetType,
      targetId: targetId,
      category: category,
      details: details,
      status: next,
      submittedAt: submittedAt,
      updatedAt: changedAt,
      revision: revision + 1,
    );
  }

  Map<String, Object> toJson() => {
    'id': id,
    'reporterAccountId': reporterAccountId,
    'targetType': targetType.name,
    'targetId': targetId,
    'category': category.name,
    'details': details,
    'status': status.name,
    'submittedAt': submittedAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'revision': revision,
  };

  factory SafetyReport.fromJson(Object? source) {
    final map = _map(source, 'report');
    final revision = map['revision'];
    if (revision is! int) throw const FormatException('Invalid revision');
    return SafetyReport(
      id: _text(map, 'id', 100, required: true),
      reporterAccountId: _text(map, 'reporterAccountId', 100, required: true),
      targetType: _enumValue(
        SafetyTargetType.values,
        map['targetType'],
        'targetType',
      ),
      targetId: _text(map, 'targetId', 100, required: true),
      category: _enumValue(ReportCategory.values, map['category'], 'category'),
      details: _text(map, 'details', 1000),
      status: _enumValue(ReportStatus.values, map['status'], 'status'),
      submittedAt: _date(map, 'submittedAt'),
      updatedAt: _date(map, 'updatedAt'),
      revision: revision,
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

T _enumValue<T extends Enum>(List<T> values, Object? source, String key) {
  if (source is! String) throw FormatException('Invalid $key');
  return values.firstWhere(
    (value) => value.name == source,
    orElse: () => throw FormatException('Invalid $key'),
  );
}
