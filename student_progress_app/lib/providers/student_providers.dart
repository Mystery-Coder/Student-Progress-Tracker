import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_progress_app/providers/auth_providers.dart';
import 'package:student_progress_app/types.dart';

/// Provides the USN for the current logged-in student
/// This is fetched once and cached for the entire app session
/// Used in tabs.dart (AppBar) and model_tab.dart (predictions)
final usnProvider = FutureProvider<String>((ref) async {
  final supabase = ref.watch(supabaseProvider);
  final user = ref.watch(currentUserProvider);
  
  if (user == null) {
    throw Exception('No user logged in');
  }
  
  final data = await supabase
      .from("STUDENT")
      .select("USN")
      .eq("user_id", user.id);
  
  if (data.isEmpty) {
    throw Exception('No student record found for user');
  }
  
  return data[0]["USN"] as String;
});

/// Provides detailed student information
/// Includes SSLC, PUC, projects, internships, and hackathons data
final studentDetailsProvider = FutureProvider<StudentDetails>((ref) async {
  final supabase = ref.watch(supabaseProvider);
  final user = ref.watch(currentUserProvider);
  
  if (user == null) {
    throw Exception('No user logged in');
  }
  
  final res = await supabase.rpc(
    'get_student_details_from_id',
    params: {'id_of_student': user.id},
  );
  
  if (res.isEmpty) {
    throw Exception('No student details found');
  }
  
  return StudentDetails(
    USN: res[0]["USN"],
    PUC: (res[0]["PUC"] as num).toDouble(),
    SSLC: (res[0]["SSLC"] as num).toDouble(),
    noOfHackathons: res[0]["No_of_Hackathons"],
    noOfInternships: res[0]["Number_Of_Internships"],
    noOfProjects: res[0]["No_of_Projects"],
  );
});
