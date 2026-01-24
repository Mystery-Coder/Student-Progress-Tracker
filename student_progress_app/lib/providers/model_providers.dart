import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

/// Model server URL configuration
const String modelURL = 'http://10.0.2.2:8000'; // For AVD
// const String modelURL = 'http://server-ip:port'; // For Physical Android Device

/// Provides ML placement prediction for a given USN
/// Uses family provider to cache predictions per USN
/// Call ref.refresh(modelPredictionProvider(usn)) to re-fetch
final modelPredictionProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, usn) async {
    if (usn.isEmpty) {
      throw Exception('USN is required for prediction');
    }
    
    final response = await http.get(Uri.parse('$modelURL/predict/$usn'));
    
    if (response.statusCode != 200) {
      throw Exception('Failed to get prediction: ${response.statusCode}');
    }
    
    return jsonDecode(response.body) as Map<String, dynamic>;
  },
);
