import 'dart:js_interop';

import 'host_bridge.dart';

@JS('unixDesktop')
external JSObject? get _desktopObject;

extension type _DesktopApi(JSObject _) implements JSObject {
  external JSPromise<JSBoolean> exportBackup(JSString payload);
  external JSPromise<JSString> importBackup();
  external JSPromise<JSString> getAppInfo();
  external void setDirty(JSBoolean dirty, JSBoolean saving);
}

HostBridge createPlatformHostBridge() => _WebHostBridge();

class _WebHostBridge implements HostBridge {
  bool _dirty = false;
  bool _saving = false;

  _DesktopApi? get _api {
    final object = _desktopObject;
    return object == null ? null : _DesktopApi(object);
  }

  @override
  bool get isAvailable => _api != null;

  @override
  Future<String?> appInfo() async {
    final api = _api;
    return api == null ? null : (await api.getAppInfo().toDart).toDart;
  }

  @override
  Future<bool> exportBackup(String payload) async {
    final api = _api;
    return api != null && (await api.exportBackup(payload.toJS).toDart).toDart;
  }

  @override
  Future<String?> importBackup() async {
    final api = _api;
    if (api == null) return null;
    final value = (await api.importBackup().toDart).toDart;
    return value.isEmpty ? null : value;
  }

  @override
  void setDirty(bool value) {
    _dirty = value;
    _syncWindowState();
  }

  @override
  void setSaving(bool value) {
    _saving = value;
    _syncWindowState();
  }

  void _syncWindowState() => _api?.setDirty(_dirty.toJS, _saving.toJS);
}
