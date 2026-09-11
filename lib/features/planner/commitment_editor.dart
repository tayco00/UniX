import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../application/workspace_controller.dart';
import '../../core/formatters.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';

Future<void> showCommitmentEditor(
  BuildContext context, {
  required WorkspaceController controller,
  required HostBridge hostBridge,
  Commitment? commitment,
}) => showDialog<void>(
  context: context,
  barrierDismissible: false,
  builder: (_) => CommitmentEditor(
    controller: controller,
    hostBridge: hostBridge,
    commitment: commitment,
  ),
);

class CommitmentEditor extends StatefulWidget {
  const CommitmentEditor({
    required this.controller,
    required this.hostBridge,
    this.commitment,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;
  final Commitment? commitment;

  @override
  State<CommitmentEditor> createState() => _CommitmentEditorState();
}

class _CommitmentEditorState extends State<CommitmentEditor> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _title;
  late final TextEditingController _duration;
  late final TextEditingController _notes;
  late String? _moduleId;
  late CommitmentKind _kind;
  late CommitmentPriority _priority;
  late DateTime _dueAt;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    final item = widget.commitment;
    final initial = DateTime.now().add(const Duration(days: 1));
    _title = TextEditingController(text: item?.title ?? '');
    _duration = TextEditingController(
      text: item?.durationMinutes.toString() ?? '60',
    );
    _notes = TextEditingController(text: item?.notes ?? '');
    _moduleId = item?.moduleId;
    _kind = item?.kind ?? CommitmentKind.submission;
    _priority = item?.priority ?? CommitmentPriority.normal;
    _dueAt =
        item?.dueAt ?? DateTime(initial.year, initial.month, initial.day, 12);
  }

  @override
  void dispose() {
    widget.hostBridge.setDirty(false);
    _title.dispose();
    _duration.dispose();
    _notes.dispose();
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
    final previous = widget.commitment;
    final now = DateTime.now();
    final item = Commitment(
      id: previous?.id ?? widget.controller.nextId('item'),
      title: _title.text.trim(),
      moduleId: _moduleId,
      kind: _kind,
      dueAt: _dueAt,
      durationMinutes: int.parse(_duration.text),
      priority: _priority,
      status: previous?.status ?? CommitmentStatus.open,
      notes: _notes.text.trim(),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    );
    if (await widget.controller.saveCommitment(item) && mounted) {
      await _close();
    }
  }

  Future<void> _delete() async {
    final item = widget.commitment;
    if (item == null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eintrag löschen?'),
        content: Text('„${item.title}“ wird dauerhaft entfernt.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Abbrechen'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Löschen'),
          ),
        ],
      ),
    );
    if (confirmed == true &&
        await widget.controller.deleteCommitment(item.id) &&
        mounted) {
      await _close();
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _dueAt,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (date == null) return;
    setState(
      () => _dueAt = DateTime(
        date.year,
        date.month,
        date.day,
        _dueAt.hour,
        _dueAt.minute,
      ),
    );
    _changed();
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_dueAt),
    );
    if (time == null) return;
    setState(
      () => _dueAt = DateTime(
        _dueAt.year,
        _dueAt.month,
        _dueAt.day,
        time.hour,
        time.minute,
      ),
    );
    _changed();
  }

  @override
  Widget build(BuildContext context) {
    final mobile = MediaQuery.sizeOf(context).width < 700;
    final modules = widget.controller.workspace!.modules
        .where((module) => !module.archived)
        .toList();
    final content = Material(
      color: AppColors.surface,
      child: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: EdgeInsets.all(mobile ? 24 : 32),
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PLANUNG',
                          style: Theme.of(context).textTheme.labelMedium
                              ?.copyWith(
                                color: AppColors.brand,
                                fontWeight: FontWeight.w800,
                                letterSpacing: .8,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          widget.commitment == null
                              ? 'Neuer Eintrag'
                              : 'Eintrag bearbeiten',
                          style: Theme.of(context).textTheme.headlineLarge,
                        ),
                      ],
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
                key: const Key('commitment-title'),
                controller: _title,
                autofocus: true,
                maxLength: 140,
                decoration: const InputDecoration(
                  labelText: 'Titel',
                  counterText: '',
                ),
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Bitte einen Titel eingeben.'
                    : null,
                onChanged: (_) => _changed(),
              ),
              const SizedBox(height: 16),
              LayoutBuilder(
                builder: (context, constraints) {
                  final stacked = constraints.maxWidth < 560;
                  final fields = [
                    DropdownButtonFormField<String?>(
                      initialValue: _moduleId,
                      decoration: const InputDecoration(
                        labelText: 'Modul (optional)',
                      ),
                      items: [
                        const DropdownMenuItem(
                          value: null,
                          child: Text('Kein Modul'),
                        ),
                        for (final module in modules)
                          DropdownMenuItem(
                            value: module.id,
                            child: Text(module.name),
                          ),
                      ],
                      onChanged: (value) {
                        setState(() => _moduleId = value);
                        _changed();
                      },
                    ),
                    DropdownButtonFormField<CommitmentKind>(
                      key: const Key('commitment-kind'),
                      initialValue: _kind,
                      decoration: const InputDecoration(labelText: 'Art'),
                      items: [
                        for (final kind in CommitmentKind.values)
                          DropdownMenuItem(
                            value: kind,
                            child: Text(kindLabel(kind)),
                          ),
                      ],
                      onChanged: (value) {
                        if (value == null) return;
                        setState(() => _kind = value);
                        _changed();
                      },
                    ),
                  ];
                  return stacked
                      ? Column(
                          children: [
                            fields[0],
                            const SizedBox(height: 16),
                            fields[1],
                          ],
                        )
                      : Row(
                          children: [
                            Expanded(child: fields[0]),
                            const SizedBox(width: 16),
                            Expanded(child: fields[1]),
                          ],
                        );
                },
              ),
              const SizedBox(height: 16),
              LayoutBuilder(
                builder: (context, constraints) {
                  final date = OutlinedButton.icon(
                    onPressed: _pickDate,
                    icon: const Icon(Icons.calendar_today_outlined),
                    label: Text(shortDate(_dueAt)),
                  );
                  final time = OutlinedButton.icon(
                    onPressed: _pickTime,
                    icon: const Icon(Icons.schedule_rounded),
                    label: Text(timeLabel(_dueAt)),
                  );
                  final duration = TextFormField(
                    controller: _duration,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: const InputDecoration(
                      labelText: 'Aufwand in Minuten',
                    ),
                    validator: (value) {
                      final parsed = int.tryParse(value ?? '');
                      return parsed == null || parsed < 0 || parsed > 1440
                          ? '0 bis 1.440 Minuten eingeben.'
                          : null;
                    },
                    onChanged: (_) => _changed(),
                  );
                  if (constraints.maxWidth < 560) {
                    return Column(
                      children: [
                        Row(
                          children: [
                            Expanded(child: date),
                            const SizedBox(width: 12),
                            Expanded(child: time),
                          ],
                        ),
                        const SizedBox(height: 16),
                        duration,
                      ],
                    );
                  }
                  return Row(
                    children: [
                      Expanded(child: date),
                      const SizedBox(width: 12),
                      Expanded(child: time),
                      const SizedBox(width: 16),
                      Expanded(child: duration),
                    ],
                  );
                },
              ),
              const SizedBox(height: 16),
              SegmentedButton<CommitmentPriority>(
                segments: const [
                  ButtonSegment(
                    value: CommitmentPriority.normal,
                    label: Text('Normal'),
                    icon: Icon(Icons.circle_outlined),
                  ),
                  ButtonSegment(
                    value: CommitmentPriority.high,
                    label: Text('Hoch'),
                    icon: Icon(Icons.priority_high_rounded),
                  ),
                ],
                selected: {_priority},
                onSelectionChanged: (values) {
                  setState(() => _priority = values.first);
                  _changed();
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _notes,
                maxLength: 2000,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Notiz (optional)',
                  hintText: 'Details, Links oder Teilaufgaben',
                  alignLabelWithHint: true,
                ),
                onChanged: (_) => _changed(),
              ),
              if (widget.controller.error != null) ...[
                const SizedBox(height: 8),
                Text(
                  widget.controller.error!,
                  style: const TextStyle(color: AppColors.danger),
                ),
              ],
              const SizedBox(height: 24),
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                runAlignment: WrapAlignment.center,
                spacing: 12,
                runSpacing: 12,
                children: [
                  if (widget.commitment != null)
                    TextButton.icon(
                      onPressed: widget.controller.saving ? null : _delete,
                      icon: const Icon(Icons.delete_outline_rounded),
                      label: const Text('Eintrag löschen'),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.danger,
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      OutlinedButton(
                        onPressed: widget.controller.saving ? null : _cancel,
                        child: const Text('Abbrechen'),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        key: const Key('commitment-save'),
                        onPressed: widget.controller.saving ? null : _save,
                        child: Text(
                          widget.commitment == null
                              ? 'Eintrag anlegen'
                              : 'Speichern',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    return PopScope<void>(
      canPop: !_dirty,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _cancel();
      },
      child: mobile
          ? Dialog.fullscreen(child: content)
          : Dialog(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: 760,
                  maxHeight: 820,
                ),
                child: content,
              ),
            ),
    );
  }
}
