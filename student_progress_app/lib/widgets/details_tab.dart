// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/providers/auth_providers.dart';
import 'package:student_progress_app/providers/student_providers.dart';
import 'package:student_progress_app/types.dart';

class DetailsTab extends ConsumerWidget {
  const DetailsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentDetailsAsync = ref.watch(studentDetailsProvider);
    final spinkit = const SpinKitChasingDots(color: Colors.red);

    return Center(
      child: studentDetailsAsync.when(
        loading: () => spinkit,
        error: (error, stack) => Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, color: Colors.red, size: 48),
            const SizedBox(height: 16),
            Text('Error: ${error.toString()}'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => ref.refresh(studentDetailsProvider),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
        data: (details) => _DetailsContent(details: details),
      ),
    );
  }
}

class _DetailsContent extends ConsumerWidget {
  final StudentDetails details;

  const _DetailsContent({required this.details});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      children: [
        ListTile(
          leading: const Icon(Icons.school),
          iconColor: Colors.amber,
          title: const Text("10th Percentage"),
          subtitle: Text("${details.SSLC}%"),
        ),
        ListTile(
          leading: const Icon(Icons.school),
          iconColor: Colors.redAccent,
          title: const Text("12th Percentage"),
          subtitle: Text("${details.PUC}%"),
        ),
        ListTile(
          leading: const Icon(Icons.assignment),
          title: const Text("Projects"),
          iconColor: Colors.blueAccent,
          subtitle: Text(details.noOfProjects.toString()),
        ),
        ListTile(
          leading: const Icon(Icons.code),
          title: const Text("Hackathons Attended"),
          iconColor: Colors.black,
          subtitle: Text(details.noOfHackathons.toString()),
        ),
        ListTile(
          leading: const Icon(Icons.work_history),
          title: const Text("Internships"),
          iconColor: Colors.blueAccent,
          subtitle: Text(details.noOfInternships.toString()),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            OutlinedButton.icon(
              onPressed: () => _showEditDialog(context, ref, details),
              icon: const Icon(Icons.edit),
              label: const Text("Edit"),
              style: ButtonStyle(
                iconColor: WidgetStateProperty.all(Colors.black),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showEditDialog(BuildContext context, WidgetRef ref, StudentDetails details) {
    final grade10Controller = TextEditingController(text: details.SSLC.toString());
    final grade12Controller = TextEditingController(text: details.PUC.toString());
    final projectsController = TextEditingController(text: details.noOfProjects.toString());
    final hackathonsController = TextEditingController(text: details.noOfHackathons.toString());
    final internshipsController = TextEditingController(text: details.noOfInternships.toString());

    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.edit_document),
        title: const Text("Editing Details"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(labelText: "10th Percentage"),
              controller: grade10Controller,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
              ],
            ),
            TextField(
              decoration: const InputDecoration(labelText: "12th Percentage"),
              controller: grade12Controller,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
              ],
            ),
            TextField(
              decoration: const InputDecoration(labelText: "Projects"),
              controller: projectsController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
            TextField(
              decoration: const InputDecoration(labelText: "Hackathons"),
              controller: hackathonsController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
            TextField(
              decoration: const InputDecoration(labelText: "Internships"),
              controller: internshipsController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              if (grade10Controller.text.isEmpty ||
                  grade12Controller.text.isEmpty ||
                  hackathonsController.text.isEmpty ||
                  projectsController.text.isEmpty ||
                  internshipsController.text.isEmpty) {
                return;
              }
              try {
                final supabase = ref.read(supabaseProvider);
                await supabase.from("STUDENT").update({
                  "SSLC": double.parse(grade10Controller.text),
                  "PUC": double.parse(grade12Controller.text),
                  "Number_Of_Internships": int.parse(internshipsController.text),
                  "No_of_Hackathons": int.parse(hackathonsController.text),
                  "No_of_Projects": int.parse(projectsController.text),
                }).eq("USN", details.USN);

                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Saved!"),
                      duration: Duration(milliseconds: 400),
                    ),
                  );
                  // Invalidate the provider to refetch data
                  ref.invalidate(studentDetailsProvider);
                  Navigator.of(context).pop();
                }
              } catch (e) {
                if (context.mounted) {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("$e"),
                      duration: const Duration(milliseconds: 400),
                    ),
                  );
                }
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }
}
