import 'package:flutter/material.dart';

import '../../application/workspace_controller.dart';
import '../../core/formatters.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';
import '../../ui/commitment_row.dart';
import '../../ui/empty_state.dart';
import '../../ui/page_frame.dart';
import '../../ui/page_header.dart';
import '../planner/commitment_editor.dart';

class HomePage extends StatelessWidget {
  const HomePage({
    required this.controller,
    required this.hostBridge,
    required this.onOpenPlanner,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;
  final VoidCallback onOpenPlanner;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final workspace = controller.workspace!;
    final open = controller.sortedCommitments(status: CommitmentStatus.open);
    final focus = controller.nextFocus(now);
    final upcoming = open
        .where((item) => item.id != focus?.id)
        .take(5)
        .toList();
    final modules = {for (final module in workspace.modules) module.id: module};
    return PageFrame(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: fullDate(now),
            title: '${greeting(now)}, ${workspace.profile.firstName}.',
            subtitle: open.isEmpty
                ? 'Dein Plan ist frei.'
                : 'Das ist jetzt wichtig – der Rest bleibt geordnet.',
            action: ElevatedButton.icon(
              key: const Key('home-add'),
              onPressed: () => showCommitmentEditor(
                context,
                controller: controller,
                hostBridge: hostBridge,
              ),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Eintrag planen'),
            ),
          ),
          const SizedBox(height: 32),
          _WeekStrip(commitments: open, now: now),
          const SizedBox(height: 24),
          if (focus == null)
            EmptyState(
              icon: Icons.done_all_rounded,
              title: workspace.commitments.isEmpty
                  ? 'Dein Plan beginnt mit einem Eintrag.'
                  : 'Alles erledigt.',
              message: workspace.commitments.isEmpty
                  ? 'Plane eine Abgabe, Prüfung oder Lernzeit. UniX zeigt dir danach automatisch den nächsten Schritt.'
                  : 'Für den Moment steht nichts mehr an. Neue Termine kannst du jederzeit ergänzen.',
              actionLabel: 'Eintrag planen',
              onAction: () => showCommitmentEditor(
                context,
                controller: controller,
                hostBridge: hostBridge,
              ),
            )
          else ...[
            _FocusCard(
              item: focus,
              module: modules[focus.moduleId],
              now: now,
              onToggle: () => controller.toggleCommitment(focus.id),
              onOpen: () => showCommitmentEditor(
                context,
                controller: controller,
                hostBridge: hostBridge,
                commitment: focus,
              ),
            ),
            if (upcoming.isNotEmpty) ...[
              const SizedBox(height: 36),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Danach',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: onOpenPlanner,
                    iconAlignment: IconAlignment.end,
                    icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                    label: const Text('Gesamten Plan öffnen'),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border.all(color: AppColors.line),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  children: [
                    for (var index = 0; index < upcoming.length; index++) ...[
                      CommitmentRow(
                        commitment: upcoming[index],
                        module: modules[upcoming[index].moduleId],
                        now: now,
                        onToggle: () =>
                            controller.toggleCommitment(upcoming[index].id),
                        onOpen: () => showCommitmentEditor(
                          context,
                          controller: controller,
                          hostBridge: hostBridge,
                          commitment: upcoming[index],
                        ),
                      ),
                      if (index != upcoming.length - 1)
                        const Divider(height: 1, indent: 24, endIndent: 24),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _WeekStrip extends StatelessWidget {
  const _WeekStrip({required this.commitments, required this.now});

  final List<Commitment> commitments;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final today = dayStart(now);
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.line),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          for (var offset = 0; offset < 7; offset++)
            Expanded(
              child: Builder(
                builder: (context) {
                  final date = today.add(Duration(days: offset));
                  final count = commitments
                      .where((item) => dayStart(item.dueAt) == date)
                      .length;
                  return Semantics(
                    label:
                        '${weekdayNames[date.weekday - 1]}, ${date.day}. ${monthNames[date.month - 1]}, $count Einträge',
                    child: Container(
                      height: 70,
                      margin: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: offset == 0
                            ? AppColors.brandSoft
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            weekdayNames[date.weekday - 1]
                                .substring(0, 2)
                                .toUpperCase(),
                            style: Theme.of(context).textTheme.labelSmall
                                ?.copyWith(
                                  color: AppColors.muted,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${date.day}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            width: 5,
                            height: 5,
                            decoration: BoxDecoration(
                              color: count > 0
                                  ? AppColors.brand
                                  : Colors.transparent,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

class _FocusCard extends StatelessWidget {
  const _FocusCard({
    required this.item,
    required this.module,
    required this.now,
    required this.onToggle,
    required this.onOpen,
  });

  final Commitment item;
  final StudyModule? module;
  final DateTime now;
  final VoidCallback onToggle;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final overdue = item.dueAt.isBefore(now);
    return InkWell(
      onTap: onOpen,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: AppColors.brandSoft,
          border: Border.all(color: const Color(0xFFBBC8FA)),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'NÄCHSTER SCHRITT',
                    style: TextStyle(
                      color: AppColors.brand,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: .9,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    item.title,
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      if (module != null)
                        Text(
                          module!.name,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      Text(
                        kindLabel(item.kind),
                        style: const TextStyle(color: AppColors.muted),
                      ),
                      Text(
                        durationLabel(item.durationMinutes),
                        style: const TextStyle(color: AppColors.muted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Icon(
                        overdue
                            ? Icons.warning_amber_rounded
                            : Icons.schedule_rounded,
                        size: 18,
                        color: overdue ? AppColors.danger : AppColors.brand,
                      ),
                      const SizedBox(width: 7),
                      Text(
                        dueLabel(item.dueAt, now),
                        style: TextStyle(
                          color: overdue ? AppColors.danger : AppColors.ink,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 20),
            Tooltip(
              message: 'Als erledigt markieren',
              child: IconButton.filledTonal(
                onPressed: onToggle,
                icon: const Icon(Icons.check_rounded),
                style: IconButton.styleFrom(
                  minimumSize: const Size(48, 48),
                  backgroundColor: AppColors.surface,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
