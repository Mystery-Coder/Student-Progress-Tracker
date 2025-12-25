// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/types.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DetailsTab extends StatefulWidget {
  const DetailsTab({super.key});

  @override
  State<DetailsTab> createState() => _DetailsTabState();
}

class _DetailsTabState extends State<DetailsTab>
    with AutomaticKeepAliveClientMixin {
  final supabase = Supabase.instance.client;
  late final user = supabase.auth.currentUser;
  StudentDetails details = StudentDetails(
    USN: "",
    PUC: 0,
    SSLC: 0,
    noOfHackathons: 0,
    noOfInternships: 0,
    noOfProjects: 0,
  );
  bool loaded = false;
  final spinkit = SpinKitChasingDots(color: Colors.red);

  TextEditingController? grade10Controller;
  TextEditingController? grade12Controller;
  TextEditingController? hackathonsController;
  TextEditingController? internshipsController;
  TextEditingController? projectsController;

  @override
  void initState() {
    super.initState();
    _getDetails();
  }

  @override
  bool get wantKeepAlive => true;

  void _getDetails() async {
    try {
      final res = await supabase.rpc(
        'get_student_details_from_id',
        params: {'id_of_student': user?.id},
      );
      // print(res);
      setState(() {
        details = StudentDetails(
          USN: res[0]["USN"],
          PUC: (res[0]["PUC"] as num).toDouble(),
          SSLC: (res[0]["SSLC"] as num).toDouble(),
          noOfHackathons: res[0]["No_of_Hackathons"],
          noOfInternships: res[0]["Number_Of_Internships"],
          noOfProjects: res[0]["No_of_Projects"],
        );

        grade10Controller = TextEditingController(
          text: details.SSLC.toString(),
        );
        grade12Controller = TextEditingController(text: details.PUC.toString());
        internshipsController = TextEditingController(
          text: details.noOfInternships.toString(),
        );
        hackathonsController = TextEditingController(
          text: details.noOfHackathons.toString(),
        );
        projectsController = TextEditingController(
          text: details.noOfProjects.toString(),
        );

        loaded = true;
      });
    } catch (e) {
      print("Details error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Center(
      child: (loaded)
          ? (ListView(
              children: [
                ListTile(
                  leading: Icon(Icons.school),
                  iconColor: Colors.amber,
                  title: Text("10th Percentage"),
                  subtitle: Text("${details.SSLC}%"),
                ),
                ListTile(
                  leading: Icon(Icons.school),
                  iconColor: Colors.redAccent,
                  title: Text("12th Percentage"),
                  subtitle: Text("${details.PUC}%"),
                ),
                ListTile(
                  leading: Icon(Icons.assignment),
                  title: Text("Projects"),
                  iconColor: Colors.blueAccent,
                  subtitle: Text(details.noOfProjects.toString()),
                ),
                ListTile(
                  leading: Icon(Icons.code),
                  title: Text("Hackathons Attended"),
                  iconColor: Colors.black,
                  subtitle: Text(details.noOfHackathons.toString()),
                ),
                ListTile(
                  leading: Icon(Icons.work_history),
                  title: Text("Internships"),
                  iconColor: Colors.blueAccent,
                  subtitle: Text(details.noOfInternships.toString()),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () {
                        showDialog(
                          barrierDismissible: false,
                          context: context,
                          builder: (context) => AlertDialog(
                            icon: Icon(Icons.edit_document),
                            title: Text("Editing Details"),

                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                TextField(
                                  decoration: InputDecoration(
                                    labelText: "10th Percentage",
                                  ),
                                  controller: grade10Controller,
                                  keyboardType: TextInputType.number,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.allow(
                                      RegExp(r'^\d*\.?\d*'),
                                    ), // Only allows 0-9
                                  ],
                                ),

                                TextField(
                                  decoration: InputDecoration(
                                    labelText: "12th Percentage",
                                  ),
                                  controller: grade12Controller,
                                  keyboardType: TextInputType.number,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.allow(
                                      RegExp(r'^\d*\.?\d*'),
                                    ), // Only allows 0-9
                                  ],
                                ),

                                TextField(
                                  decoration: InputDecoration(
                                    labelText: "Projects",
                                  ),
                                  controller: projectsController,
                                  keyboardType: TextInputType.number,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                  ],
                                ),

                                TextField(
                                  decoration: InputDecoration(
                                    labelText: "Hackathons",
                                  ),
                                  controller: hackathonsController,
                                  keyboardType: TextInputType.number,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                  ],
                                ),

                                TextField(
                                  decoration: InputDecoration(
                                    labelText: "Internships",
                                  ),
                                  controller: internshipsController,

                                  keyboardType: TextInputType.number,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                  ],
                                ),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: Text("Cancel"),
                              ),
                              TextButton(
                                onPressed: () async {
                                  if (grade10Controller!.text.isEmpty ||
                                      grade12Controller!.text.isEmpty ||
                                      hackathonsController!.text.isEmpty ||
                                      projectsController!.text.isEmpty ||
                                      internshipsController!.text.isEmpty) {
                                    return;
                                  }
                                  try {
                                    await supabase
                                        .from("STUDENT")
                                        .update({
                                          "SSLC": double.parse(
                                            grade10Controller!.text,
                                          ),
                                          "PUC": double.parse(
                                            grade12Controller!.text,
                                          ),
                                          "Number_Of_Internships": int.parse(
                                            internshipsController!.text,
                                          ),
                                          "No_of_Hackathons": int.parse(
                                            hackathonsController!.text,
                                          ),
                                          "No_of_Projects": int.parse(
                                            projectsController!.text,
                                          ),
                                        })
                                        .eq("USN", details.USN);
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text("Saved!"),
                                          duration: Duration(milliseconds: 400),
                                        ),
                                      );
                                      loaded = false;
                                      _getDetails();
                                      Navigator.of(context).pop();
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      Navigator.of(context).pop();
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text("$e"),
                                          duration: Duration(milliseconds: 400),
                                        ),
                                      );
                                    }
                                  }
                                },
                                child: Text("Save"),
                              ),
                            ],
                          ),
                        );
                      },
                      icon: Icon(Icons.edit),
                      label: Text("Edit"),
                      style: ButtonStyle(
                        iconColor: WidgetStateProperty.all(Colors.black),
                      ),
                    ),
                  ],
                ),
              ],
            ))
          : spinkit,
    );
  }
}
