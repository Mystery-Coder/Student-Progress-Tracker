import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/types.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AcademicsTab extends StatefulWidget {
  const AcademicsTab({super.key});

  @override
  State<AcademicsTab> createState() => _AcademicsTabState();
}

class _AcademicsTabState extends State<AcademicsTab>
    with AutomaticKeepAliveClientMixin {
  final supabase = Supabase.instance.client;
  late final user = supabase.auth.currentUser;
  final spinkit = SpinKitFadingFour(color: Colors.indigoAccent);
  final semesterColors = {
    1: Colors.blue.shade200,
    // 2: Colors.blue.shade200,
    2: Colors.red.shade200,
    // 4: Colors.green.shade200,
    3: Colors.orange.shade200,
    // 6: Colors.orange.shade200,
    4: Colors.purple.shade200,
    // 8: Colors.purple.shade200,
  };

  bool loaded = false;
  List<AcademicDetails> academicDetails = [];

  @override
  void initState() {
    super.initState();
    _getAcademicDetails();
  }

  @override
  bool get wantKeepAlive => true;

  void _getAcademicDetails() async {
    try {
      final academicDetailsRes = await supabase.rpc(
        'get_academic_details_from_id',
        params: {'id_of_user': user?.id},
      );
      setState(() {
        if (academicDetailsRes.isNotEmpty) {
          academicDetails = academicDetailsRes.map<AcademicDetails>((
            academicDetail,
          ) {
            return AcademicDetails(
              CourseCode: academicDetail['Course_Code'],
              CourseName: academicDetail['Course_Name'],
              Semester: academicDetail['Semester'],
              Grade: academicDetail['Grade'],
              CreditsEarned: academicDetail['Credits_earned'],
              Year: academicDetail['Year'],
            );
          }).toList();
          academicDetails.sort((a, b) => a.Semester.compareTo(b.Semester));
        }
        loaded = true;
      });
    } catch (e) {
      print("Error getting academic detials: $e");
    }
  }

  void _showAcademicDetailDialog(BuildContext context) {
    TextEditingController courseCodeController = TextEditingController();
    TextEditingController courseNameController = TextEditingController();
    TextEditingController semesterController = TextEditingController();
    TextEditingController yearController = TextEditingController();
    TextEditingController gradeController = TextEditingController();
    TextEditingController creditsController = TextEditingController();

    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (context) {
        return AlertDialog(
          icon: Icon(Icons.add_box_outlined),
          title: Text("Add Course"),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: InputDecoration(hint: Text("Enter Course Code")),
                  keyboardType: TextInputType.text,
                  controller: courseCodeController,
                ),
                TextField(
                  decoration: InputDecoration(hint: Text("Enter Course Name")),
                  keyboardType: TextInputType.text,
                  controller: courseNameController,
                ),
                TextField(
                  decoration: InputDecoration(hint: Text("Enter Semester")),
                  keyboardType: TextInputType.number,
                  controller: semesterController,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
                TextField(
                  decoration: InputDecoration(hint: Text("Enter Grade")),
                  keyboardType: TextInputType.text,
                  controller: gradeController,
                ),
                TextField(
                  decoration: InputDecoration(
                    hint: Text("Enter Credits Earned"),
                  ),
                  keyboardType: TextInputType.number,
                  controller: creditsController,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
                TextField(
                  decoration: InputDecoration(hint: Text("Enter Year")),
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
                // Clear controllers
                courseCodeController.clear();
                courseNameController.clear();
                semesterController.clear();
                gradeController.clear();
                creditsController.clear();
                yearController.clear();
                Navigator.of(context).pop();
              },
              child: Text("Cancel"),
            ),
            TextButton(
              onPressed: () async {
                try {
                  // Validate all fields
                  if (courseCodeController.text.isEmpty ||
                      courseNameController.text.isEmpty ||
                      semesterController.text.isEmpty ||
                      gradeController.text.isEmpty ||
                      creditsController.text.isEmpty ||
                      yearController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Fill All Fields"),
                        backgroundColor: Colors.orange,
                      ),
                    );
                    return;
                  }
                  final detailsRes = await supabase.rpc(
                    'get_student_details_from_id',
                    params: {'id_of_student': supabase.auth.currentUser?.id},
                  );

                  // Insert into database
                  await supabase.from("ACADEMIC_DETAILS").insert({
                    "AD_USSN": detailsRes[0]['USN'],
                    "Course_Code": courseCodeController.text,
                    "Course_Name": courseNameController.text,
                    "Semester": int.parse(semesterController.text),
                    "Grade": gradeController.text,
                    "Credits_earned": int.parse(creditsController.text),
                    "Year": int.parse(yearController.text),
                  });

                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Course Added Successfully!"),
                        backgroundColor: Colors.green,
                        duration: Duration(milliseconds: 600),
                      ),
                    );
                  }

                  // Clear controllers
                  courseCodeController.clear();
                  courseNameController.clear();
                  semesterController.clear();
                  gradeController.clear();
                  creditsController.clear();
                  yearController.clear();

                  // Reload data
                  setState(() {
                    loaded = false;
                  });
                  _getAcademicDetails();

                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Error: ${e.toString()}"),
                        backgroundColor: Colors.red,
                        duration: Duration(milliseconds: 1000),
                      ),
                    );
                  }
                }
              },
              child: Text("Add"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Center(
      child: loaded
          ? (academicDetails.isEmpty
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Add Your Courses",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                      SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => _showAcademicDetailDialog(context),
                        icon: Icon(Icons.add),
                        label: Text("Add Course"),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: ElevatedButton.icon(
                          onPressed: () => _showAcademicDetailDialog(context),
                          icon: Icon(Icons.add),
                          label: Text("Add Course"),
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
                                  style: TextStyle(fontWeight: FontWeight.w500),
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
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                tileColor:
                                    semesterColors[(academicDetail.Semester +
                                            1) ~/
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
                  ))
          : spinkit,
    );
  }
}
