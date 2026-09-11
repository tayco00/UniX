import 'package:flutter/foundation.dart';

import '../domain/workspace.dart';
import '../domain/workspace_repository.dart';

class WorkspaceController extends ChangeNotifier {
  WorkspaceController(this._repository, {DateTime Function()? now})
    : _now = now ?? DateTime.now;

  final WorkspaceRepository _repository;
  final DateTime Function() _now;
  Workspace? _workspace;
  bool _loading = true;
  bool _saving = false;
  String? _error;
  int _idSequence = 0;

  Workspace? get workspace => _workspace;
  bool get loading => _loading;
  bool get saving => _saving;
  String? get error => _error;

  Future<void> initialize() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _workspace = await _repository.load();
    } catch (_) {
      _error = 'UniX konnte deine Planung nicht öffnen.';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  String nextId(String prefix) {
    _idSequence += 1;
    return '$prefix-${_now().microsecondsSinceEpoch}-$_idSequence';
  }

  Future<bool> completeSetup(StudentProfile profile) =>
      _commit(_required.copyWith(setupComplete: true, profile: profile));

  Future<bool> saveProfile(StudentProfile profile) =>
      _commit(_required.copyWith(profile: profile));

  Future<bool> saveModule(StudyModule module) {
    final modules = [..._required.modules];
    final index = modules.indexWhere((item) => item.id == module.id);
    if (index == -1) {
      if (modules.length >= 100) {
        return _fail('Es können höchstens 100 Module angelegt werden.');
      }
      modules.add(module);
    } else {
      modules[index] = module;
    }
    return _commit(_required.copyWith(modules: modules));
  }

  Future<bool> saveCommitment(Commitment commitment) {
    final items = [..._required.commitments];
    final index = items.indexWhere((item) => item.id == commitment.id);
    if (index == -1) {
      if (items.length >= 5000) {
        return _fail('Es können höchstens 5.000 Einträge angelegt werden.');
      }
      items.add(commitment);
    } else {
      items[index] = commitment;
    }
    return _commit(_required.copyWith(commitments: items));
  }

  Future<bool> toggleCommitment(String id) {
    if (!_required.commitments.any((item) => item.id == id)) {
      return _fail('Dieser Eintrag existiert nicht mehr.');
    }
    final now = _now();
    final items = _required.commitments
        .map(
          (item) => item.id == id
              ? item.copyWith(
                  status: item.status == CommitmentStatus.open
                      ? CommitmentStatus.done
                      : CommitmentStatus.open,
                  updatedAt: now,
                )
              : item,
        )
        .toList();
    return _commit(_required.copyWith(commitments: items));
  }

  Future<bool> deleteCommitment(String id) {
    if (!_required.commitments.any((item) => item.id == id)) {
      return _fail('Dieser Eintrag existiert nicht mehr.');
    }
    return _commit(
      _required.copyWith(
        commitments: _required.commitments
            .where((item) => item.id != id)
            .toList(),
      ),
    );
  }

  Future<bool> importJson(String source) async {
    try {
      return await _commit(Workspace.decode(source));
    } on FormatException {
      return _fail(
        'Diese Sicherung ist ungültig oder nicht mit UniX kompatibel.',
      );
    }
  }

  String exportJson() => _required.encode();

  Future<bool> reset() async {
    if (_saving) return false;
    _saving = true;
    _error = null;
    notifyListeners();
    try {
      await _repository.clear();
      _workspace = Workspace.empty(_now());
      return true;
    } catch (_) {
      _error = 'UniX konnte nicht zurückgesetzt werden.';
      return false;
    } finally {
      _saving = false;
      notifyListeners();
    }
  }

  List<Commitment> sortedCommitments({CommitmentStatus? status}) {
    final items = _required.commitments
        .where((item) => status == null || item.status == status)
        .toList();
    items.sort((a, b) {
      if (a.status != b.status) {
        return a.status == CommitmentStatus.open ? -1 : 1;
      }
      final due = a.dueAt.compareTo(b.dueAt);
      if (due != 0) return due;
      if (a.priority != b.priority) {
        return a.priority == CommitmentPriority.high ? -1 : 1;
      }
      return a.createdAt.compareTo(b.createdAt);
    });
    return items;
  }

  Commitment? nextFocus([DateTime? reference]) {
    final now = reference ?? _now();
    final open = sortedCommitments(status: CommitmentStatus.open);
    if (open.isEmpty) return null;
    final overdue = open.where((item) => item.dueAt.isBefore(now)).toList();
    return overdue.isNotEmpty ? overdue.first : open.first;
  }

  List<Commitment> search(String query, CommitmentStatus? status) {
    final normalized = query.trim().toLowerCase();
    final moduleNames = {
      for (final module in _required.modules) module.id: module.name,
    };
    return sortedCommitments(status: status).where((item) {
      if (normalized.isEmpty) return true;
      return [
        item.title,
        item.notes,
        moduleNames[item.moduleId] ?? '',
      ].any((value) => value.toLowerCase().contains(normalized));
    }).toList();
  }

  Workspace get _required {
    final value = _workspace;
    if (value == null) throw StateError('Workspace is not loaded');
    return value;
  }

  Future<bool> _commit(Workspace candidate) async {
    if (_saving) return false;
    _saving = true;
    _error = null;
    notifyListeners();
    try {
      final validated = Workspace.fromJson(
        candidate.copyWith(updatedAt: _now()).toJson(),
      );
      await _repository.save(validated);
      _workspace = validated;
      return true;
    } catch (_) {
      _error = 'Die Änderung konnte nicht gespeichert werden. Deine Eingabe bleibt erhalten.';
      return false;
    } finally {
      _saving = false;
      notifyListeners();
    }
  }

  Future<bool> _fail(String message) async {
    _error = message;
    notifyListeners();
    return false;
  }

  void clearError() {
    if (_error == null) return;
    _error = null;
    notifyListeners();
  }
}
