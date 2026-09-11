import 'host_bridge.dart';

HostBridge createPlatformHostBridge() => const _StubHostBridge();

class _StubHostBridge implements HostBridge {
  const _StubHostBridge();

  @override
  bool get isAvailable => false;

  @override
  Future<String?> appInfo() async => null;

  @override
  Future<bool> exportBackup(String payload) async => false;

  @override
  Future<String?> importBackup() async => null;

  @override
  void setDirty(bool value) {}

  @override
  void setSaving(bool value) {}
}
