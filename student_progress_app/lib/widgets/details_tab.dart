// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:student_progress_app/types.dart';

class DetailsTab extends StatefulWidget {
  final StudentDetails details;
  const DetailsTab({super.key, required this.details});

  @override
  State<DetailsTab> createState() => _DetailsTabState();
}

class _DetailsTabState extends State<DetailsTab> {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("Student Details - ${widget.details.USN} ${widget.details.PUC}"),
        ],
      ),
    );
  }
}
