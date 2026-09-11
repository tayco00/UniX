import 'dart:async';

import 'package:flutter/material.dart';

import '../application/workspace_controller.dart';
import '../core/platform/host_bridge.dart';
import '../core/theme/app_theme.dart';
import '../features/courses/courses_page.dart';
import '../features/home/home_page.dart';
import '../features/planner/planner_page.dart';
import '../features/settings/settings_page.dart';
import 'brand.dart';

class AppShell extends StatefulWidget {
  const AppShell({
    required this.controller,
    required this.hostBridge,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;
  Timer? _clock;

  static const destinations = [
    _Destination('Heute', Icons.home_outlined, Icons.home_rounded),
    _Destination(
      'Planer',
      Icons.calendar_today_outlined,
      Icons.calendar_today_rounded,
    ),
    _Destination('Module', Icons.book_outlined, Icons.book_rounded),
    _Destination(
      'Einstellungen',
      Icons.settings_outlined,
      Icons.settings_rounded,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _clock = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _clock?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final compact = width < 1080;
    final mobile = width < 700;
    final pages = [
      HomePage(
        controller: widget.controller,
        hostBridge: widget.hostBridge,
        onOpenPlanner: () => setState(() => _index = 1),
      ),
      PlannerPage(controller: widget.controller, hostBridge: widget.hostBridge),
      CoursesPage(controller: widget.controller, hostBridge: widget.hostBridge),
      SettingsPage(
        controller: widget.controller,
        hostBridge: widget.hostBridge,
      ),
    ];

    return Scaffold(
      body: Row(
        children: [
          if (!mobile)
            _DesktopNavigation(
              compact: compact,
              selected: _index,
              destinations: destinations,
              profileName: widget.controller.workspace!.profile.firstName,
              program: widget.controller.workspace!.profile.program,
              onSelect: (value) => setState(() => _index = value),
            ),
          Expanded(
            child: Column(
              children: [
                if (widget.controller.error != null)
                  _ErrorBanner(
                    message: widget.controller.error!,
                    onDismiss: widget.controller.clearError,
                  ),
                Expanded(
                  child: FocusTraversalGroup(
                    child: IndexedStack(index: _index, children: pages),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: mobile
          ? NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: (value) => setState(() => _index = value),
              destinations: [
                for (final destination in destinations)
                  NavigationDestination(
                    icon: Icon(destination.icon),
                    selectedIcon: Icon(destination.selectedIcon),
                    label: destination.label,
                  ),
              ],
            )
          : null,
    );
  }
}

class _DesktopNavigation extends StatelessWidget {
  const _DesktopNavigation({
    required this.compact,
    required this.selected,
    required this.destinations,
    required this.profileName,
    required this.program,
    required this.onSelect,
  });

  final bool compact;
  final int selected;
  final List<_Destination> destinations;
  final String profileName;
  final String program;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: compact ? 88 : 232,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(right: BorderSide(color: AppColors.line)),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 14 : 18,
        vertical: 24,
      ),
      child: Column(
        crossAxisAlignment: compact
            ? CrossAxisAlignment.center
            : CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: compact ? 0 : 8),
            child: BrandLockup(compact: compact),
          ),
          const SizedBox(height: 48),
          for (var index = 0; index < destinations.length; index++) ...[
            _NavButton(
              compact: compact,
              destination: destinations[index],
              selected: index == selected,
              onPressed: () => onSelect(index),
            ),
            const SizedBox(height: 6),
          ],
          const Spacer(),
          const Divider(),
          const SizedBox(height: 14),
          Tooltip(
            message: '$profileName · $program',
            child: Row(
              mainAxisAlignment: compact
                  ? MainAxisAlignment.center
                  : MainAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.butter,
                  foregroundColor: AppColors.ink,
                  child: Text(profileName.characters.first.toUpperCase()),
                ),
                if (!compact) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          profileName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          program,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: AppColors.muted),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.compact,
    required this.destination,
    required this.selected,
    required this.onPressed,
  });

  final bool compact;
  final _Destination destination;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final button = Material(
      color: selected ? AppColors.brandSoft : Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 48,
          child: Row(
            mainAxisAlignment: compact
                ? MainAxisAlignment.center
                : MainAxisAlignment.start,
            children: [
              if (!compact) const SizedBox(width: 14),
              Icon(
                selected ? destination.selectedIcon : destination.icon,
                size: 21,
                color: selected ? AppColors.brand : AppColors.muted,
              ),
              if (!compact) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    destination.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
    return compact
        ? Tooltip(message: destination.label, child: button)
        : button;
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.onDismiss});

  final String message;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFFFE7E2),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: AppColors.danger),
              const SizedBox(width: 10),
              Expanded(child: Text(message)),
              IconButton(
                onPressed: onDismiss,
                tooltip: 'Meldung schließen',
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Destination {
  const _Destination(this.label, this.icon, this.selectedIcon);
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}
