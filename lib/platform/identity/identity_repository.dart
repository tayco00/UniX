import 'student_identity.dart';

abstract interface class IdentityRepository {
  Future<StudentIdentity?> currentIdentity();

  Future<StudentIdentity> saveProfile(PublicStudentProfile profile);

  Future<CampusMembership> requestMembershipVerification({
    required String institutionId,
  });

  Future<void> signOut();
}
