import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';
import 'package:unix/data/preferences_workspace_repository.dart';

import '../support/fakes.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
  });

  test('returns a new workspace when no value exists', () async {
    final repository = PreferencesWorkspaceRepository();
    final workspace = await repository.load();
    expect(workspace.setupComplete, isFalse);
    expect(workspace.modules, isEmpty);
    expect(workspace.commitments, isEmpty);
  });

  test('persists and restores the complete workspace', () async {
    final repository = PreferencesWorkspaceRepository();
    final source = readyWorkspace(
      modules: [module()],
      commitments: [commitment()],
    );
    await repository.save(source);
    final restored = await repository.load();
    expect(restored.encode(), source.encode());
  });

  test('clear removes the persisted workspace', () async {
    final repository = PreferencesWorkspaceRepository();
    await repository.save(readyWorkspace());
    await repository.clear();
    expect((await repository.load()).setupComplete, isFalse);
  });
}
