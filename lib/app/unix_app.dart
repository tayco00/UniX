import 'package:flutter/material.dart';

import '../application/workspace_controller.dart';
import '../core/platform/host_bridge.dart';
import '../core/theme/app_theme.dart';
import '../features/onboarding/onboarding_page.dart';
import '../ui/app_shell.dart';
import '../ui/brand.dart';

class UnixApp extends StatefulWidget {
  const UnixApp({required this.controller, this.hostBridge, super.key});

  final WorkspaceController controller;
  final HostBridge? hostBridge;

  @override
  State<UnixApp> createState() => _UnixAppState();
}

class _UnixAppState extends State<UnixApp> {
  late final HostBridge _hostBridge = widget.hostBridge ?? createHostBridge();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_syncSavingState);
    widget.controller.initialize();
  }

  void _syncSavingState() => _hostBridge.setSaving(widget.controller.saving);

  @override
  void dispose() {
    widget.controller.removeListener(_syncSavingState);
    _hostBridge.setSaving(false);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UniX',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: ListenableBuilder(
        listenable: widget.controller,
        builder: (context, _) {
          final controller = widget.controller;
          if (controller.loading) return const _LoadingView();
          if (controller.workspace == null) {
            return _StartupError(
              message: controller.error ?? 'UniX konnte nicht geöffnet werden.',
              onRetry: controller.initialize,
            );
          }
          if (!controller.workspace!.setupComplete) {
            return OnboardingPage(
              controller: controller,
              hostBridge: _hostBridge,
            );
          }
          return AppShell(controller: controller, hostBridge: _hostBridge);
        },
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            BrandMark(size: 52),
            SizedBox(height: 24),
            SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(strokeWidth: 3),
            ),
            SizedBox(height: 14),
            Text('UniX wird geöffnet …'),
          ],
        ),
      ),
    );
  }
}

class _StartupError extends StatelessWidget {
  const _StartupError({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 460),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BrandMark(size: 52),
                const SizedBox(height: 24),
                Text(
                  'UniX konnte nicht starten.',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(message, textAlign: TextAlign.center),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Erneut versuchen'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
