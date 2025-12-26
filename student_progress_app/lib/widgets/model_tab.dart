import 'package:flutter/material.dart';

class ModelTab extends StatefulWidget {
  const ModelTab({super.key});

  @override
  State<ModelTab> createState() => _ModelTabState();
}

class _ModelTabState extends State<ModelTab> {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Model for Placement Chance"));
  }
}
