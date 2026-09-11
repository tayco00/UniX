import 'package:unix/core/platform/host_bridge.dart';
import 'package:unix/domain/workspace.dart';
import 'package:unix/domain/workspace_repository.dart';

class MemoryWorkspaceRepository implements WorkspaceRepository {
  MemoryWorkspaceRepository({
    Workspace? initial,
    this.loadError,
    this.saveError,
  }) : stored = initial;

  Workspace? stored;
  Object? loadError;
  Object? saveError;
  int loadCount = 0;
  int saveCount = 0;
  int clearCount = 0;

  @override
  Future<Workspace> load() async {
    loadCount += 1;
    if (loadError != null) throw loadError!;
    return stored ?? Workspace.empty(DateTime(2026, 9, 11, 9));
  }

  @override
  Future<void> save(Workspace workspace) async {
    saveCount += 1;
    if (saveError != null) throw saveError!;
    stored = workspace;
  }

  @override
  Future<void> clear() async {
    clearCount += 1;
    if (saveError != null) throw saveError!;
    stored = null;
  }
}

class FakeHostBridge implements HostBridge {
  FakeHostBridge({this.available = true});

  final bool available;
  bool dirty = false;
  bool saving = false;
  String? exported;
  String? imported;

  @override
  bool get isAvailable => available;

  @override
  Future<bool> exportBackup(String payload) async {
    exported = payload;
    return true;
  }

  @override
  Future<String?> importBackup() async => imported;

  @override
  Future<String?> appInfo() async => '{"version":"0.5.0"}';

  @override
  void setDirty(bool value) => dirty = value;

  @override
  void setSaving(bool value) => saving = value;
}

StudentProfile completeProfile({String name = 'Taylan'}) => StudentProfile(
  firstName: name,
  university: 'HTW Dresden',
  program: 'Wirtschaftsinformatik',
  semester: '3. Semester',
);

Workspace readyWorkspace({
  List<StudyModule> modules = const [],
  List<Commitment> commitments = const [],
}) => Workspace(
  schemaVersion: 1,
  setupComplete: true,
  profile: completeProfile(),
  modules: modules,
  commitments: commitments,
  updatedAt: DateTime(2026, 9, 11, 9),
);

StudyModule module({
  String id = 'module-1',
  String name = 'Statistik',
  bool archived = false,
}) => StudyModule(
  id: id,
  name: name,
  shortName: 'STAT',
  tone: ModuleTone.blue,
  archived: archived,
);

Commitment commitment({
  String id = 'item-1',
  String title = 'Übungsblatt abgeben',
  String? moduleId = 'module-1',
  CommitmentKind kind = CommitmentKind.submission,
  CommitmentPriority priority = CommitmentPriority.normal,
  CommitmentStatus status = CommitmentStatus.open,
  DateTime? dueAt,
  String notes = '',
}) {
  final created = DateTime(2026, 9, 10, 8);
  return Commitment(
    id: id,
    title: title,
    moduleId: moduleId,
    kind: kind,
    dueAt: dueAt ?? DateTime(2026, 9, 12, 12),
    durationMinutes: 60,
    priority: priority,
    status: status,
    notes: notes,
    createdAt: created,
    updatedAt: created,
  );
}
