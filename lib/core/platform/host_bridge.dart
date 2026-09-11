import 'host_bridge_stub.dart'
    if (dart.library.js_interop) 'host_bridge_web.dart';

abstract interface class HostBridge {
  bool get isAvailable;
  Future<bool> exportBackup(String payload);
  Future<String?> importBackup();
  Future<String?> appInfo();
  void setDirty(bool value);
  void setSaving(bool value);
}

HostBridge createHostBridge() => createPlatformHostBridge();
