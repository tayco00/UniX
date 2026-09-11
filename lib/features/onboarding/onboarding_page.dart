import 'package:flutter/material.dart';

import '../../application/workspace_controller.dart';
import '../../core/platform/host_bridge.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/workspace.dart';
import '../../ui/brand.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({
    required this.controller,
    required this.hostBridge,
    super.key,
  });

  final WorkspaceController controller;
  final HostBridge hostBridge;

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _university = TextEditingController();
  final _program = TextEditingController();
  final _semester = TextEditingController();
  bool _dirty = false;

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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final success = await widget.controller.completeSetup(
      StudentProfile(
        firstName: _firstName.text,
        university: _university.text,
        program: _program.text,
        semester: _semester.text,
      ),
    );
    if (success) widget.hostBridge.setDirty(false);
  }

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 920;
    final form = _OnboardingForm(
      formKey: _formKey,
      firstName: _firstName,
      university: _university,
      program: _program,
      semester: _semester,
      saving: widget.controller.saving,
      error: widget.controller.error,
      onChanged: _changed,
      onSubmit: _submit,
    );
    return Scaffold(
      body: SafeArea(
        child: wide
            ? Row(
                children: [
                  const Expanded(flex: 5, child: _OnboardingStory()),
                  Expanded(flex: 6, child: form),
                ],
              )
            : SingleChildScrollView(child: form),
      ),
    );
  }
}

class _OnboardingStory extends StatelessWidget {
  const _OnboardingStory();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: double.infinity,
      padding: const EdgeInsets.all(56),
      color: AppColors.brandSoft,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const BrandLockup(),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: AppColors.butter,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Text(
              'DEIN STUDIUM, EIN KLARER PLAN',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: .8,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Heute wissen,\nwas wirklich zählt.',
            style: Theme.of(context).textTheme.displayLarge
                ?.copyWith(fontSize: 54),
          ),
          const SizedBox(height: 20),
          Text(
            'UniX ordnet Module, Termine und Lernzeit zu einem Plan, der im Alltag funktioniert.',
            style: Theme.of(context).textTheme.bodyLarge
                ?.copyWith(color: AppColors.muted),
          ),
          const Spacer(),
          const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppColors.brand),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Klarer Fokus statt Funktionsfülle',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _OnboardingForm extends StatelessWidget {
  const _OnboardingForm({
    required this.formKey,
    required this.firstName,
    required this.university,
    required this.program,
    required this.semester,
    required this.saving,
    required this.error,
    required this.onChanged,
    required this.onSubmit,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController firstName;
  final TextEditingController university;
  final TextEditingController program;
  final TextEditingController semester;
  final bool saving;
  final String? error;
  final ValueChanged<String> onChanged;
  final VoidCallback onSubmit;

  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'Bitte ausfüllen.' : null;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 48),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Form(
            key: formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (MediaQuery.sizeOf(context).width < 920) ...[
                  const BrandLockup(),
                  const SizedBox(height: 48),
                ],
                Text(
                  'Willkommen',
                  style: Theme.of(context).textTheme.labelLarge
                      ?.copyWith(color: AppColors.brand),
                ),
                const SizedBox(height: 10),
                Text(
                  'Richte UniX für dich ein.',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 10),
                Text(
                  'Drei Angaben reichen für deine persönliche Übersicht.',
                  style: Theme.of(context).textTheme.bodyLarge
                      ?.copyWith(color: AppColors.muted),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  key: const Key('onboarding-first-name'),
                  controller: firstName,
                  autofocus: true,
                  maxLength: 80,
                  decoration: const InputDecoration(
                    labelText: 'Vorname',
                    counterText: '',
                  ),
                  validator: _required,
                  onChanged: onChanged,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: university,
                  maxLength: 120,
                  decoration: const InputDecoration(
                    labelText: 'Hochschule',
                    hintText: 'z. B. HTW Dresden',
                    counterText: '',
                  ),
                  validator: _required,
                  onChanged: onChanged,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: program,
                  maxLength: 120,
                  decoration: const InputDecoration(
                    labelText: 'Studiengang',
                    hintText: 'z. B. Wirtschaftsinformatik',
                    counterText: '',
                  ),
                  validator: _required,
                  onChanged: onChanged,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: semester,
                  maxLength: 40,
                  decoration: const InputDecoration(
                    labelText: 'Semester (optional)',
                    hintText: 'z. B. 3. Semester',
                    counterText: '',
                  ),
                  onChanged: onChanged,
                  onFieldSubmitted: (_) => onSubmit(),
                ),
                if (error != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    error!,
                    style: const TextStyle(color: AppColors.danger),
                    semanticsLabel: 'Fehler: $error',
                  ),
                ],
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  key: const Key('onboarding-submit'),
                  onPressed: saving ? null : onSubmit,
                  icon: saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.arrow_forward_rounded),
                  iconAlignment: IconAlignment.end,
                  label: const Text('UniX einrichten'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
