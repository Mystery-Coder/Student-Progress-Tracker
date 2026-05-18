import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:student_progress_app/providers/student_providers.dart';

/// Model server URL configuration
const String modelURL = 'http://10.0.2.2:8000'; // For AVD
// const String modelURL = 'http://server-ip:port'; // For Physical Android Device

/// Provides ML placement prediction for a given USN
/// Uses family provider to cache predictions per USN
/// Call ref.refresh(modelPredictionProvider(usn)) to re-fetch
final modelPredictionProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final usn = await ref.watch(usnProvider.future);

  if (usn.isEmpty) {
    throw Exception('USN is required for prediction');
  }

  final response = await http.get(Uri.parse('$modelURL/predict/$usn'));

  if (response.statusCode != 200) {
    throw Exception('Failed to get prediction: ${response.statusCode}');
  }

  return jsonDecode(response.body) as Map<String, dynamic>;
});
