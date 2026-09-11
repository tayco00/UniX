import 'package:shared_preferences/shared_preferences.dart';

import '../domain/workspace.dart';
import '../domain/workspace_repository.dart';

class PreferencesWorkspaceRepository implements WorkspaceRepository {
  PreferencesWorkspaceRepository({SharedPreferencesAsync? preferences})
    : _preferences = preferences ?? SharedPreferencesAsync();

  static const storageKey = 'app.unix.workspace.v1';
  final SharedPreferencesAsync _preferences;

  @override
  Future<Workspace> load() async {
    final stored = await _preferences.getString(storageKey);
    return stored == null ? Workspace.empty() : Workspace.decode(stored);
  }

  @override
  Future<void> save(Workspace workspace) =>
      _preferences.setString(storageKey, workspace.encode());

  @override
  Future<void> clear() => _preferences.remove(storageKey);
}
