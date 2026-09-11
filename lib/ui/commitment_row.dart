import 'package:flutter/material.dart';

import '../core/formatters.dart';
import '../core/theme/app_theme.dart';
import '../domain/workspace.dart';

class CommitmentRow extends StatelessWidget {
  const CommitmentRow({
    required this.commitment,
    required this.module,
    required this.now,
    required this.onToggle,
    required this.onOpen,
    super.key,
  });

  final Commitment commitment;
  final StudyModule? module;
  final DateTime now;
  final VoidCallback onToggle;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final done = commitment.status == CommitmentStatus.done;
    final overdue = !done && commitment.dueAt.isBefore(now);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                button: true,
                label: done
                    ? '${commitment.title} wieder öffnen'
                    : '${commitment.title} erledigen',
                child: IconButton(
                  onPressed: onToggle,
                  tooltip: done ? 'Wieder öffnen' : 'Erledigen',
                  icon: Icon(
                    done
                        ? Icons.check_circle_rounded
                        : Icons.radio_button_unchecked_rounded,
                  ),
                  color: done ? AppColors.brand : AppColors.lineStrong,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      commitment.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        decoration: done ? TextDecoration.lineThrough : null,
                        color: done ? AppColors.muted : AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 7,
                      runSpacing: 5,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        if (module != null) _ModuleLabel(module: module!),
                        Text(
                          kindLabel(commitment.kind),
                          style: _metaStyle(context),
                        ),
                        Container(
                          width: 3,
                          height: 3,
                          decoration: const BoxDecoration(
                            color: AppColors.lineStrong,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Text(
                          durationLabel(commitment.durationMinutes),
                          style: _metaStyle(context),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 170),
                child: Text(
                  done ? 'Erledigt' : dueLabel(commitment.dueAt, now),
                  textAlign: TextAlign.end,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: overdue ? AppColors.danger : AppColors.muted,
                    fontWeight: overdue ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              const Padding(
                padding: EdgeInsets.only(top: 10),
                child: Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.muted,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  TextStyle? _metaStyle(BuildContext context) =>
      Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.muted);
}

class _ModuleLabel extends StatelessWidget {
  const _ModuleLabel({required this.module});

  final StudyModule module;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: moduleBackground(module.tone),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        module.shortName,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: moduleColor(module.tone),
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
