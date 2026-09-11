import 'package:flutter/material.dart';

import '../../application/workspace_controller.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';
import '../../ui/empty_state.dart';
import '../../ui/page_header.dart';
import '../../ui/page_frame.dart';
import 'module_editor.dart';

class CoursesPage extends StatelessWidget {
  const CoursesPage({
    required this.controller,
    required this.hostBridge,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;

  @override
  Widget build(BuildContext context) {
    final modules = controller.workspace!.modules;
    return PageFrame(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Studium',
            title: 'Module',
            subtitle: 'Ordne deine Einträge dem richtigen Kontext zu.',
            action: ElevatedButton.icon(
              onPressed: () => showModuleEditor(
                context,
                controller: controller,
                hostBridge: hostBridge,
              ),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Neues Modul'),
            ),
          ),
          const SizedBox(height: 36),
          if (modules.isEmpty)
            EmptyState(
              icon: Icons.book_outlined,
              title: 'Deine Module beginnen hier.',
              message: 'Lege ein Modul an, damit Aufgaben und Lernblöcke sofort ihren Kontext bekommen.',
              actionLabel: 'Erstes Modul anlegen',
              onAction: () => showModuleEditor(
                context,
                controller: controller,
                hostBridge: hostBridge,
              ),
            )
          else
            Material(
              color: AppColors.surface,
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: AppColors.line),
                borderRadius: BorderRadius.circular(18),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  for (var index = 0; index < modules.length; index++) ...[
                    _ModuleRow(
                      module: modules[index],
                      openCount: controller.workspace!.commitments
                          .where(
                            (item) =>
                                item.moduleId == modules[index].id &&
                                item.status == CommitmentStatus.open,
                          )
                          .length,
                      onOpen: () => showModuleEditor(
                        context,
                        controller: controller,
                        hostBridge: hostBridge,
                        module: modules[index],
                      ),
                    ),
                    if (index != modules.length - 1)
                      const Divider(height: 1, indent: 24, endIndent: 24),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _ModuleRow extends StatelessWidget {
  const _ModuleRow({
    required this.module,
    required this.openCount,
    required this.onOpen,
  });

  final StudyModule module;
  final int openCount;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      onTap: onOpen,
      leading: Container(
        width: 46,
        height: 46,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: moduleBackground(module.tone),
          borderRadius: BorderRadius.circular(12),
        ),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            module.shortName,
            style: TextStyle(
              color: moduleColor(module.tone),
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
      title: Text(
        module.name,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: Text(
        module.archived
            ? 'Archiviert'
            : '$openCount offene ${openCount == 1 ? 'Verpflichtung' : 'Verpflichtungen'}',
      ),
      trailing: const Icon(Icons.chevron_right_rounded),
    );
  }
}
