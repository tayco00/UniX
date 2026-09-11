import 'package:flutter/material.dart';

import 'app/unix_app.dart';
import 'application/workspace_controller.dart';
import 'data/preferences_workspace_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    UnixApp(controller: WorkspaceController(PreferencesWorkspaceRepository())),
  );
}
