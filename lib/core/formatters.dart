import '../domain/workspace.dart';

const monthNames = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
const weekdayNames = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

String fullDate(DateTime value) =>
    '${weekdayNames[value.weekday - 1]}, ${value.day}. ${monthNames[value.month - 1]}';

String shortDate(DateTime value) =>
    '${value.day.toString().padLeft(2, '0')}.${value.month.toString().padLeft(2, '0')}.${value.year}';

String timeLabel(DateTime value) =>
    '${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';

DateTime dayStart(DateTime value) =>
    DateTime(value.year, value.month, value.day);

String dueLabel(DateTime dueAt, DateTime now) {
  final days = dayStart(dueAt).difference(dayStart(now)).inDays;
  final time = timeLabel(dueAt);
  if (days == 0) return 'Heute · $time';
  if (days == 1) return 'Morgen · $time';
  if (days == -1) return 'Seit gestern fällig · $time';
  if (days < 0) return 'Seit ${days.abs()} Tagen fällig · $time';
  if (days < 7) return 'In $days Tagen · $time';
  return '${shortDate(dueAt)} · $time';
}

String durationLabel(int minutes) {
  if (minutes == 0) return 'Nicht geschätzt';
  if (minutes < 60) return '$minutes Min.';
  final hours = minutes ~/ 60;
  final rest = minutes % 60;
  return rest == 0 ? '$hours Std.' : '$hours Std. $rest Min.';
}

String kindLabel(CommitmentKind kind) => switch (kind) {
  CommitmentKind.exam => 'Prüfung',
  CommitmentKind.submission => 'Abgabe',
  CommitmentKind.study => 'Lernblock',
  CommitmentKind.organization => 'Organisation',
  CommitmentKind.dining => 'Mensa/Cafétaria',
};

String greeting(DateTime now) {
  if (now.hour < 11) return 'Guten Morgen';
  if (now.hour < 18) return 'Hallo';
  return 'Guten Abend';
}
