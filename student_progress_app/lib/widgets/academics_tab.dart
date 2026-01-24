import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/providers/academics_providers.dart';
import 'package:student_progress_app/providers/auth_providers.dart';

class AcademicsTab extends ConsumerWidget {
  const AcademicsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final academicDetailsAsync = ref.watch(academicDetailsProvider);
    final cgpa = ref.watch(cgpaProvider);
    final spinkit = const SpinKitFadingFour(color: Colors.indigoAccent);

    final semesterColors = {
      1: Colors.blue.shade200,
      2: Colors.red.shade200,
      3: Colors.orange.shade200,
      4: Colors.purple.shade200,
    };

    return Center(
      child: academicDetailsAsync.when(
        loading: () => spinkit,
        error: (error, stack) => Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, color: Colors.red, size: 48),
            const SizedBox(height: 16),
            Text('Error: ${error.toString()}'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => ref.refresh(academicDetailsProvider),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
        data: (academicDetails) => academicDetails.isEmpty
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Add Your Courses",
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w300),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _showAcademicDetailDialog(context, ref),
                    icon: const Icon(Icons.add),
                    label: const Text("Add Course"),
                  ),
                ],
              )
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton.icon(
                      onPressed: () => _showAcademicDetailDialog(context, ref),
                      icon: const Icon(Icons.add),
                      label: const Text("Add Course"),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      "CGPA: $cgpa",
                      style: const TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: 23,
                      ),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: academicDetails.length,
                      itemBuilder: (context, idx) {
                        final academicDetail = academicDetails[idx];
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8.0,
                            vertical: 4.0,
                          ),
                          child: ListTile(
                            title: Text(
                              academicDetail.CourseName,
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(academicDetail.CourseCode),
                                Text(
                                  'Sem ${academicDetail.Semester} • Year ${academicDetail.Year} • Grade: ${academicDetail.Grade}',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[700],
                                  ),
                                ),
                              ],
                            ),
                            trailing: Text(
                              '${academicDetail.CreditsEarned} credits',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            tileColor:
                                semesterColors[(academicDetail.Semester + 1) ~/
                                    2],
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  void _showAcademicDetailDialog(BuildContext context, WidgetRef ref) {
    final courseCodeController = TextEditingController();
    final courseNameController = TextEditingController();
    final semesterController = TextEditingController();
    final yearController = TextEditingController();
    final gradeController = TextEditingController();
    final creditsController = TextEditingController();

    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (context) {
        return AlertDialog(
          icon: const Icon(Icons.add_box_outlined),
          title: const Text("Add Course"),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    hint: Text("Enter Course Code"),
                  ),
                  keyboardType: TextInputType.text,
                  controller: courseCodeController,
                ),
                TextField(
                  decoration: const InputDecoration(
                    hint: Text("Enter Course Name"),
                  ),
                  keyboardType: TextInputType.text,
                  controller: courseNameController,
                ),
                TextField(
                  decoration: const InputDecoration(
                    hint: Text("Enter Semester"),
                  ),
                  keyboardType: TextInputType.number,
                  controller: semesterController,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
                TextField(
                  decoration: const InputDecoration(hint: Text("Enter Grade")),
                  keyboardType: TextInputType.text,
                  controller: gradeController,
                ),
                TextField(
                  decoration: const InputDecoration(
                    hint: Text("Enter Credits Earned"),
                  ),
                  keyboardType: TextInputType.number,
                  controller: creditsController,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
                TextField(
                  decoration: const InputDecoration(hint: Text("Enter Year")),
                  keyboardType: TextInputType.number,
                  controller: yearController,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                courseCodeController.clear();
                courseNameController.clear();
                semesterController.clear();
                gradeController.clear();
                creditsController.clear();
                yearController.clear();
                Navigator.of(context).pop();
              },
              child: const Text("Cancel"),
            ),
            TextButton(
              onPressed: () async {
                try {
                  if (courseCodeController.text.isEmpty ||
                      courseNameController.text.isEmpty ||
                      semesterController.text.isEmpty ||
                      gradeController.text.isEmpty ||
                      creditsController.text.isEmpty ||
                      yearController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Fill All Fields"),
                        backgroundColor: Colors.orange,
                      ),
                    );
                    return;
                  }

                  final supabase = ref.read(supabaseProvider);
                  final detailsRes = await supabase.rpc(
                    'get_student_details_from_id',
                    params: {'id_of_student': supabase.auth.currentUser?.id},
                  );

                  await supabase.from("ACADEMIC_DETAILS").insert({
                    "AD_USN": detailsRes[0]['USN'],
                    "Course_Code": courseCodeController.text,
                    "Course_Name": courseNameController.text,
                    "Semester": int.parse(semesterController.text),
                    "Grade": gradeController.text,
                    "Credits_earned": int.parse(creditsController.text),
                    "Year": int.parse(yearController.text),
                  });

                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Course Added Successfully!"),
                        backgroundColor: Colors.green,
                        duration: Duration(milliseconds: 600),
                      ),
                    );
                  }

                  // Invalidate provider to refetch data
                  ref.invalidate(academicDetailsProvider);

                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Error: ${e.toString()}"),
                        backgroundColor: Colors.red,
                        duration: const Duration(milliseconds: 1000),
                      ),
                    );
                  }
                }
              },
              child: const Text("Add"),
            ),
          ],
        );
      },
    );
  }
}
