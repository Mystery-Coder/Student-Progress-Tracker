import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Provides the Supabase client instance
/// This is the single source of truth for the Supabase client across the app
final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

/// Provides the current authenticated user
/// Returns null if no user is logged in
final currentUserProvider = Provider<User?>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return supabase.auth.currentUser;
});
