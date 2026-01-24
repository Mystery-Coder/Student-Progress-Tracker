import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_progress_app/providers/auth_providers.dart';
import 'package:student_progress_app/types.dart';

/// Provides the list of groups the current student belongs to
final groupsProvider = FutureProvider<List<GroupDetails>>((ref) async {
  final supabase = ref.watch(supabaseProvider);
  final user = ref.watch(currentUserProvider);
  
  if (user == null) {
    throw Exception('No user logged in');
  }
  
  final res = await supabase.rpc(
    'get_student_groups_from_id',
    params: {'id_of_student': user.id},
  );
  
  if (res.isEmpty) {
    return [];
  }
  
  return res.map<GroupDetails>((group) {
    return GroupDetails(
      GroupID: group['Group_ID'],
      GroupName: group['Group_Name'],
    );
  }).toList();
});
