import 'dart:convert';

import 'package:flutter/material.dart';

import '../../application/workspace_controller.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';
import '../../ui/page_frame.dart';
import '../../ui/page_header.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({
    required this.controller,
    required this.hostBridge,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstName;
  late final TextEditingController _university;
  late final TextEditingController _program;
  late final TextEditingController _semester;
  bool _dirty = false;
  String _version = '0.5.0';

  @override
  void initState() {
    super.initState();
    final profile = widget.controller.workspace!.profile;
    _firstName = TextEditingController(text: profile.firstName);
    _university = TextEditingController(text: profile.university);
    _program = TextEditingController(text: profile.program);
    _semester = TextEditingController(text: profile.semester);
    _loadInfo();
  }

  Future<void> _loadInfo() async {
    final raw = await widget.hostBridge.appInfo();
    if (raw == null || !mounted) return;
    try {
      final info = jsonDecode(raw) as Map<String, dynamic>;
      setState(() => _version = info['version']?.toString() ?? _version);
    } catch (_) {
      // Product operation is unaffected when host metadata is unavailable.
    }
  }

  @override
  void dispose() {
    widget.hostBridge.setDirty(false);
    _firstName.dispose();
    _university.dispose();
    _program.dispose();
    _semester.dispose();
    super.dispose();
  }

  void _changed(String _) {
    if (_dirty) return;
    setState(() => _dirty = true);
    widget.hostBridge.setDirty(true);
  }

  void _syncProfile() {
    final profile = widget.controller.workspace!.profile;
    _firstName.text = profile.firstName;
    _university.text = profile.university;
    _program.text = profile.program;
    _semester.text = profile.semester;
    setState(() => _dirty = false);
    widget.hostBridge.setDirty(false);
  }

  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'Bitte ausfüllen.' : null;

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    final success = await widget.controller.saveProfile(
      StudentProfile(
        firstName: _firstName.text,
        university: _university.text,
        program: _program.text,
        semester: _semester.text,
      ),
    );
    if (!success || !mounted) return;
    setState(() => _dirty = false);
    widget.hostBridge.setDirty(false);
    _show('Profil gespeichert');
  }

  Future<bool> _confirmDiscard() async {
    if (!_dirty) return true;
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Profiländerungen verwerfen?'),
            content: const Text(
              'Deine Eingaben wurden noch nicht gespeichert.',
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
        ) ??
        false;
  }

  Future<void> _export() async {
    final saved = await widget.hostBridge.exportBackup(
      widget.controller.exportJson(),
    );
    if (mounted && saved) _show('Sicherung gespeichert');
  }

  Future<void> _import() async {
    if (!await _confirmDiscard() || !mounted) return;
    final source = await widget.hostBridge.importBackup();
    if (source == null || !mounted) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aktuelle Planung ersetzen?'),
        content: const Text(
          'Profil, Module und Einträge werden durch die gewählte Sicherung ersetzt.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Abbrechen'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Wiederherstellen'),
          ),
        ],
      ),
    );
    if (confirmed == true &&
        await widget.controller.importJson(source) &&
        mounted) {
      _syncProfile();
      _show('Sicherung wiederhergestellt');
    }
  }

  Future<void> _reset() async {
    if (!await _confirmDiscard() || !mounted) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('UniX neu beginnen?'),
        content: const Text(
          'Dein Profil, alle Module und alle Einträge werden entfernt.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Abbrechen'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Alles entfernen'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      widget.hostBridge.setDirty(false);
      await widget.controller.reset();
    }
  }

  void _show(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return PageFrame(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            eyebrow: 'UniX',
            title: 'Einstellungen',
            subtitle: 'Profil, Sicherungen und ein sauberer Neustart.',
          ),
          const SizedBox(height: 36),
          _SettingsSection(
            icon: Icons.person_outline_rounded,
            title: 'Studienprofil',
            description: 'So personalisiert UniX deine Übersicht.',
            child: Form(
              key: _formKey,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final stacked = constraints.maxWidth < 620;
                  final fields = [
                    _field(_firstName, 'Vorname', 80, required: true),
                    _field(_university, 'Hochschule', 120, required: true),
                    _field(_program, 'Studiengang', 120, required: true),
                    _field(_semester, 'Semester (optional)', 40),
                  ];
                  final rows = stacked
                      ? <Widget>[
                          for (final field in fields) ...[
                            field,
                            const SizedBox(height: 14),
                          ],
                        ]
                      : <Widget>[
                          Row(
                            children: [
                              Expanded(child: fields[0]),
                              const SizedBox(width: 16),
                              Expanded(child: fields[1]),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(child: fields[2]),
                              const SizedBox(width: 16),
                              Expanded(child: fields[3]),
                            ],
                          ),
                          const SizedBox(height: 18),
                        ];
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ...rows,
                      ElevatedButton(
                        key: const Key('settings-save-profile'),
                        onPressed: widget.controller.saving || !_dirty
                            ? null
                            : _saveProfile,
                        child: const Text('Profil speichern'),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
          if (widget.hostBridge.isAvailable) ...[
            const Divider(height: 1),
            _SettingsSection(
              icon: Icons.inventory_2_outlined,
              title: 'Sicherung',
              description:
                  'Exportiere Profil, Module und Einträge in eine Datei.',
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  OutlinedButton.icon(
                    onPressed: widget.controller.saving ? null : _export,
                    icon: const Icon(Icons.download_rounded),
                    label: const Text('Sicherung exportieren'),
                  ),
                  OutlinedButton.icon(
                    onPressed: widget.controller.saving ? null : _import,
                    icon: const Icon(Icons.upload_rounded),
                    label: const Text('Wiederherstellen'),
                  ),
                ],
              ),
            ),
          ],
          const Divider(height: 1),
          _SettingsSection(
            icon: Icons.restart_alt_rounded,
            iconColor: AppColors.danger,
            title: 'Neu beginnen',
            description:
                'Entfernt dein Profil, deine Module und deine gesamte Planung.',
            child: OutlinedButton(
              onPressed: widget.controller.saving ? null : _reset,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.danger,
                side: const BorderSide(color: AppColors.danger),
              ),
              child: const Text('UniX zurücksetzen'),
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Text(
              'Version $_version',
              style: Theme.of(context).textTheme.bodySmall
                  ?.copyWith(color: AppColors.muted),
            ),
          ),
        ],
      ),
    );
  }

  TextFormField _field(
    TextEditingController controller,
    String label,
    int maximum, {
    bool required = false,
  }) {
    return TextFormField(
      controller: controller,
      maxLength: maximum,
      decoration: InputDecoration(labelText: label, counterText: ''),
      validator: required ? _required : null,
      onChanged: _changed,
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({
    required this.icon,
    required this.title,
    required this.description,
    required this.child,
    this.iconColor = AppColors.brand,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String description;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final stacked = constraints.maxWidth < 760;
          final heading = Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: iconColor),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 5),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.bodyMedium
                          ?.copyWith(color: AppColors.muted),
                    ),
                  ],
                ),
              ),
            ],
          );
          if (stacked) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [heading, const SizedBox(height: 20), child],
            );
          }
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(width: 310, child: heading),
              const SizedBox(width: 48),
              Expanded(child: child),
            ],
          );
        },
      ),
    );
  }
}
