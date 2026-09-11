import 'package:flutter/material.dart';

import '../../application/workspace_controller.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';
import '../../ui/commitment_row.dart';
import '../../ui/empty_state.dart';
import '../../ui/page_frame.dart';
import '../../ui/page_header.dart';
import 'commitment_editor.dart';

enum PlannerFilter { open, all, done }

class PlannerPage extends StatefulWidget {
  const PlannerPage({
    required this.controller,
    required this.hostBridge,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;

  @override
  State<PlannerPage> createState() => _PlannerPageState();
}

class _PlannerPageState extends State<PlannerPage> {
  final _search = TextEditingController();
  PlannerFilter _filter = PlannerFilter.open;
  int _visible = 50;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final status = switch (_filter) {
      PlannerFilter.open => CommitmentStatus.open,
      PlannerFilter.done => CommitmentStatus.done,
      PlannerFilter.all => null,
    };
    final results = widget.controller.search(_search.text, status);
    final shown = results.take(_visible).toList();
    final modules = {
      for (final module in widget.controller.workspace!.modules)
        module.id: module,
    };
    final now = DateTime.now();
    return PageFrame(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Planung',
            title: 'Planer',
            subtitle: 'Alle Prüfungen, Abgaben und Lernzeiten in einer verlässlichen Reihenfolge.',
            action: ElevatedButton.icon(
              onPressed: () => showCommitmentEditor(
                context,
                controller: widget.controller,
                hostBridge: widget.hostBridge,
              ),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Eintrag planen'),
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.line),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              children: [
                Wrap(
                  spacing: 16,
                  runSpacing: 14,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    SegmentedButton<PlannerFilter>(
                      segments: const [
                        ButtonSegment(
                          value: PlannerFilter.open,
                          label: Text('Offen'),
                        ),
                        ButtonSegment(
                          value: PlannerFilter.all,
                          label: Text('Alle'),
                        ),
                        ButtonSegment(
                          value: PlannerFilter.done,
                          label: Text('Erledigt'),
                        ),
                      ],
                      selected: {_filter},
                      onSelectionChanged: (values) => setState(() {
                        _filter = values.first;
                        _visible = 50;
                      }),
                    ),
                    ConstrainedBox(
                      constraints: const BoxConstraints(
                        minWidth: 240,
                        maxWidth: 360,
                      ),
                      child: TextField(
                        controller: _search,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.search_rounded),
                          hintText: 'Plan durchsuchen',
                          labelText: 'Suche',
                        ),
                        onChanged: (_) => setState(() => _visible = 50),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(height: 1),
                if (shown.isEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: EmptyState(
                      icon: _search.text.isEmpty
                          ? Icons.event_available_rounded
                          : Icons.search_off_rounded,
                      title: _search.text.isEmpty
                          ? 'Hier ist gerade nichts offen.'
                          : 'Keine passenden Einträge.',
                      message: _search.text.isEmpty
                          ? 'Plane einen neuen Eintrag oder wechsle zu „Alle“.'
                          : 'Ändere deine Suche oder setze die Filter zurück.',
                      actionLabel: _search.text.isEmpty
                          ? 'Eintrag planen'
                          : 'Suche zurücksetzen',
                      onAction: _search.text.isEmpty
                          ? () => showCommitmentEditor(
                              context,
                              controller: widget.controller,
                              hostBridge: widget.hostBridge,
                            )
                          : () => setState(() {
                              _search.clear();
                              _filter = PlannerFilter.open;
                            }),
                    ),
                  )
                else
                  for (var index = 0; index < shown.length; index++) ...[
                    CommitmentRow(
                      commitment: shown[index],
                      module: modules[shown[index].moduleId],
                      now: now,
                      onToggle: () =>
                          widget.controller.toggleCommitment(shown[index].id),
                      onOpen: () => showCommitmentEditor(
                        context,
                        controller: widget.controller,
                        hostBridge: widget.hostBridge,
                        commitment: shown[index],
                      ),
                    ),
                    if (index != shown.length - 1)
                      const Divider(height: 1, indent: 16, endIndent: 16),
                  ],
                if (shown.length < results.length) ...[
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: () => setState(() => _visible += 50),
                    child: Text(
                      'Weitere anzeigen (${results.length - shown.length})',
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
