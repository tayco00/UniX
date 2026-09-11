import 'package:flutter/material.dart';

import '../../application/workspace_controller.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';

Future<void> showModuleEditor(
  BuildContext context, {
  required WorkspaceController controller,
  required HostBridge hostBridge,
  StudyModule? module,
}) => showDialog<void>(
  context: context,
  barrierDismissible: false,
  builder: (_) => ModuleEditor(
    controller: controller,
    hostBridge: hostBridge,
    module: module,
  ),
);

class ModuleEditor extends StatefulWidget {
  const ModuleEditor({
    required this.controller,
    required this.hostBridge,
    this.module,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;
  final StudyModule? module;

  @override
  State<ModuleEditor> createState() => _ModuleEditorState();
}

class _ModuleEditorState extends State<ModuleEditor> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _shortName;
  late ModuleTone _tone;
  late bool _archived;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.module?.name ?? '');
    _shortName = TextEditingController(text: widget.module?.shortName ?? '');
    _tone = widget.module?.tone ?? ModuleTone.blue;
    _archived = widget.module?.archived ?? false;
  }

  @override
  void dispose() {
    widget.hostBridge.setDirty(false);
    _name.dispose();
    _shortName.dispose();
    super.dispose();
  }

  void _changed() {
    if (_dirty) return;
    setState(() => _dirty = true);
    widget.hostBridge.setDirty(true);
  }

  Future<void> _close() async {
    if (!mounted) return;
    setState(() => _dirty = false);
    widget.hostBridge.setDirty(false);
    await Future<void>.delayed(Duration.zero);
    if (mounted) Navigator.pop(context);
  }

  Future<void> _cancel() async {
    if (_dirty) {
      final discard = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Eingaben verwerfen?'),
          content: const Text(
            'Deine Änderungen wurden noch nicht gespeichert.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Weiter bearbeiten'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Verwerfen'),
            ),
          ],
        ),
      );
      if (discard != true || !mounted) return;
    }
    await _close();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final module = StudyModule(
      id: widget.module?.id ?? widget.controller.nextId('module'),
      name: _name.text.trim(),
      shortName: _shortName.text.trim().toUpperCase(),
      tone: _tone,
      archived: _archived,
    );
    if (await widget.controller.saveModule(module) && mounted) {
      await _close();
    }
  }

  @override
  Widget build(BuildContext context) {
    final mobile = MediaQuery.sizeOf(context).width < 700;
    final dialog = Dialog(
      insetPadding: mobile
          ? EdgeInsets.zero
          : const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
      shape: mobile ? const RoundedRectangleBorder() : null,
      child: ConstrainedBox(
        constraints: mobile
            ? const BoxConstraints.expand()
            : const BoxConstraints(maxWidth: 560, maxHeight: 820),
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.all(mobile ? 24 : 32),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.module == null
                              ? 'Modul anlegen'
                              : 'Modul bearbeiten',
                          style: Theme.of(context).textTheme.headlineLarge,
                        ),
                      ),
                      IconButton(
                        onPressed: _cancel,
                        tooltip: 'Schließen',
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                  TextFormField(
                    key: const Key('module-name'),
                    controller: _name,
                    autofocus: true,
                    maxLength: 100,
                    decoration: const InputDecoration(
                      labelText: 'Modulname',
                      hintText: 'z. B. Statistik',
                      counterText: '',
                    ),
                    validator: (value) => value == null || value.trim().isEmpty
                        ? 'Bitte einen Modulnamen eingeben.'
                        : null,
                    onChanged: (_) => _changed(),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _shortName,
                    maxLength: 12,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'Kurzbezeichnung',
                      hintText: 'z. B. STAT',
                      counterText: '',
                    ),
                    validator: (value) => value == null || value.trim().isEmpty
                        ? 'Bitte eine Kurzbezeichnung eingeben.'
                        : null,
                    onChanged: (_) => _changed(),
                  ),
                  const SizedBox(height: 20),
                  Text('Farbe', style: Theme.of(context).textTheme.labelLarge),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    children: [
                      for (final tone in ModuleTone.values)
                        Semantics(
                          label: 'Modulfarbe ${tone.name}',
                          selected: _tone == tone,
                          child: InkWell(
                            onTap: () {
                              setState(() => _tone = tone);
                              _changed();
                            },
                            borderRadius: BorderRadius.circular(24),
                            child: Container(
                              width: 44,
                              height: 44,
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: _tone == tone
                                      ? AppColors.ink
                                      : Colors.transparent,
                                  width: 2,
                                ),
                              ),
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  color: moduleColor(tone),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  if (widget.module != null) ...[
                    const SizedBox(height: 18),
                    SwitchListTile.adaptive(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Modul archivieren'),
                      subtitle: const Text(
                        'Bestehende Einträge behalten ihre Zuordnung.',
                      ),
                      value: _archived,
                      onChanged: (value) {
                        setState(() => _archived = value);
                        _changed();
                      },
                    ),
                  ],
                  if (widget.controller.error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      widget.controller.error!,
                      style: const TextStyle(color: AppColors.danger),
                    ),
                  ],
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton(
                        onPressed: widget.controller.saving ? null : _cancel,
                        child: const Text('Abbrechen'),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        key: const Key('module-save'),
                        onPressed: widget.controller.saving ? null : _save,
                        child: Text(
                          widget.module == null ? 'Modul anlegen' : 'Speichern',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    return PopScope<void>(
      canPop: !_dirty,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _cancel();
      },
      child: dialog,
    );
  }
}
