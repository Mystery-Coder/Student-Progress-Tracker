import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert'; // Required for JSON decoding
import 'package:http/http.dart' as http;

class ModelTab extends StatefulWidget {
  const ModelTab({super.key});

  @override
  State<ModelTab> createState() => _ModelTabState();
}

class _ModelTabState extends State<ModelTab>
    with AutomaticKeepAliveClientMixin {
  final supabase = Supabase.instance.client;
  late final user = supabase.auth.currentUser;

  final String modelURL = 'http://10.0.2.2:8000';
  final spinkit = SpinKitDualRing(color: Colors.deepOrangeAccent, size: 40);

  // ignore: non_constant_identifier_names
  String USN = '';
  bool loaded = false;
  Map<String, dynamic>? predictionData;
  bool isLoadingPrediction = false;

  @override
  void initState() {
    super.initState();
    _getUSN();
  }

  @override
  bool get wantKeepAlive => true;

  void _getModelOutput() async {
    setState(() {
      isLoadingPrediction = true;
    });

    try {
      final res = await http.get(Uri.parse('$modelURL/predict/$USN'));
      final data = await jsonDecode(res.body);

      setState(() {
        predictionData = data;
        isLoadingPrediction = false;
      });
    } catch (e) {
      print("Error getting model output, $e");
      setState(() {
        isLoadingPrediction = false;
      });
    }
  }

  void _getUSN() async {
    try {
      final data = await supabase
          .from("STUDENT")
          .select("USN")
          .eq("user_id", user!.id);

      setState(() {
        USN = data[0]["USN"];
        loaded = true;
      });
    } catch (e) {
      print("details error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Center(
      child: loaded
          ? (predictionData == null
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.psychology,
                        size: 80,
                        color: Colors.deepOrangeAccent,
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Get Your Placement Prediction',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 30),
                      ElevatedButton.icon(
                        onPressed: isLoadingPrediction ? null : _getModelOutput,
                        icon: isLoadingPrediction
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.analytics),
                        label: Text(
                          isLoadingPrediction
                              ? 'Analyzing...'
                              : 'Get Prediction',
                        ),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 40,
                            vertical: 16,
                          ),
                          backgroundColor: Colors.deepOrangeAccent,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  )
                : _buildPredictionResult())
          : spinkit,
    );
  }

  Widget _buildPredictionResult() {
    final score =
        (predictionData!['placement_score'] ?? predictionData!['confidence'])
            .toDouble();
    final prediction = predictionData!['prediction'];
    final features = predictionData!['features'] as Map<String, dynamic>;
    final recommendation = predictionData!['recommendation'] as String;
    final isPlaced = prediction.toString().toLowerCase() == 'placed';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Header with student info
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    predictionData!['name'] ?? 'Student',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    predictionData!['usn'] ?? USN,
                    style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Circular progress indicator
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 180,
                        height: 180,
                        child: CircularProgressIndicator(
                          value: score / 100,
                          strokeWidth: 12,
                          backgroundColor: Colors.grey[200],
                          color: isPlaced ? Colors.green : Colors.orange,
                        ),
                      ),
                      Column(
                        children: [
                          Text(
                            '${score.toStringAsFixed(1)}%',
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: isPlaced ? Colors.green : Colors.orange,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              prediction,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Placement Confidence Score',
                    style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Features section
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.assessment, color: Colors.deepOrangeAccent),
                      SizedBox(width: 8),
                      Text(
                        'Academic Profile',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildFeatureGrid(features),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Recommendations section
          Card(
            elevation: 4,
            color: Colors.blue[50],
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.lightbulb, color: Colors.blue),
                      SizedBox(width: 8),
                      Text(
                        'Recommendations',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildRecommendations(recommendation),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Refresh button
          ElevatedButton.icon(
            onPressed: isLoadingPrediction ? null : _getModelOutput,
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh Prediction'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildFeatureGrid(Map<String, dynamic> features) {
    final items = features.entries.map((e) {
      String label = e.key
          .replaceAllMapped(RegExp(r'([A-Z])'), (match) => ' ${match.group(0)}')
          .trim();

      return _buildFeatureItem(label, e.value.toString());
    }).toList();

    return Center(
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        alignment: WrapAlignment.center,
        children: items,
      ),
    );
  }

  Widget _buildFeatureItem(String label, String value) {
    final screenWidth = MediaQuery.of(context).size.width;
    final itemWidth = (screenWidth - 80) / 2;

    return Container(
      width: itemWidth > 150 ? itemWidth : 150,
      constraints: const BoxConstraints(minWidth: 150),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendations(String recommendation) {
    final lines = recommendation
        .split('\n')
        .where((line) => line.trim().isNotEmpty)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((line) {
        final trimmed = line.trim();
        if (trimmed.startsWith('•')) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '• ',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Expanded(
                  child: Text(
                    trimmed.substring(1).trim(),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
          );
        } else {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              trimmed,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
          );
        }
      }).toList(),
    );
  }
}
