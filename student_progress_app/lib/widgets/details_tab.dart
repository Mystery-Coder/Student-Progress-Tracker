// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
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
      print(res);
      setState(() {
        details = StudentDetails(
          USN: res[0]["USN"],
          PUC: (res[0]["PUC"] as num).toDouble(),
          SSLC: (res[0]["SSLC"] as num).toDouble(),
          noOfHackathons: res[0]["No_of_Hackathons"],
          noOfInternships: res[0]["Number_Of_Internships"],
          noOfProjects: res[0]["No_of_Projects"],
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
                      onPressed: () {},
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
