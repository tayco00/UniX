import 'workspace.dart';

abstract interface class WorkspaceRepository {
  Future<Workspace> load();
  Future<void> save(Workspace workspace);
  Future<void> clear();
}
