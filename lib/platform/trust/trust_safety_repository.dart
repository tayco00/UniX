import 'trust_safety.dart';

abstract interface class TrustSafetyRepository {
  Future<List<String>> blockedAccountIds();

  Future<BlockRelation> blockAccount(String accountId);

  Future<void> unblockAccount(String accountId);

  Future<SafetyReport> submitReport(SafetyReport report);
}
