import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_progress_app/providers/auth_providers.dart';
import 'package:student_progress_app/types.dart';

/// Grade point mapping for CGPA calculation
const gradeMapping = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "C+": 6,
  "C": 5,
  "P": 4,
};

/// Provides the list of academic courses for the current student
/// Data is sorted by semester
final academicDetailsProvider = FutureProvider<List<AcademicDetails>>((
  ref,
) async {
  final supabase = ref.watch(supabaseProvider);
  final user = ref.watch(currentUserProvider);

  if (user == null) {
    throw Exception('No user logged in');
  }

  final academicDetailsRes = await supabase.rpc(
    'get_academic_details_from_id',
    params: {'id_of_user': user.id},
  );

  if (academicDetailsRes.isEmpty) {
    return [];
  }

  final details = academicDetailsRes.map<AcademicDetails>((academicDetail) {
    return AcademicDetails(
      CourseCode: academicDetail['Course_Code'],
      CourseName: academicDetail['Course_Name'],
      Semester: academicDetail['Semester'],
      Grade: academicDetail['Grade'],
      CreditsEarned: academicDetail['Credits_earned'],
      Year: academicDetail['Year'],
    );
  }).toList();

  details.sort(
    (AcademicDetails a, AcademicDetails b) => a.Semester.compareTo(b.Semester),
  );

  return details;
});

/// Provides the computed CGPA based on academic details
/// Automatically recalculates when academic details change
final cgpaProvider = Provider<double>((ref) {
  final academicDetailsAsync = ref.watch(academicDetailsProvider);

  return academicDetailsAsync.when(
    data: (academicDetails) {
      if (academicDetails.isEmpty) return 0.0;

      int totalCredits = 0;
      int totalGradePoints = 0;

      for (var course in academicDetails) {
        totalCredits += course.CreditsEarned;
        totalGradePoints += gradeMapping[course.Grade]! * course.CreditsEarned;
      }

      if (totalCredits == 0) return 0.0;

      return double.parse((totalGradePoints / totalCredits).toStringAsFixed(2));
    },
    loading: () => 0.0,
    error: (_, __) => 0.0,
  );
});
