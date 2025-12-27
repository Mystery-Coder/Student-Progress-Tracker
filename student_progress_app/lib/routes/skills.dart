import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/types.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class Skills extends StatefulWidget {
  const Skills({super.key});
  static const routeName = "/skills";
  @override
  State<Skills> createState() => _SkillsState();
}

class _SkillsState extends State<Skills> with AutomaticKeepAliveClientMixin {
  final supabase = Supabase.instance.client;
  final spinkit = SpinKitHourGlass(color: Colors.deepOrange);

  List<SkillsDetails> skills = [];
  // ignore: non_constant_identifier_names
  String? USN;
  bool loaded = false;
  TextEditingController skillNameController = TextEditingController();
  TextEditingController ratingController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _getSkills();
  }

  @override
  bool get wantKeepAlive => true;

  void _getSkills() async {
    try {
      final skillsRes = await supabase.rpc(
        'get_skills_from_id',
        params: {'id_of_user': supabase.auth.currentUser?.id},
      );

      final detailsRes = await supabase.rpc(
        'get_student_details_from_id',
        params: {'id_of_student': supabase.auth.currentUser?.id},
      );

      setState(() {
        skills = skillsRes.map<SkillsDetails>((skill) {
          return SkillsDetails(
            SkillName: skill['Skill_Name'],
            Rating: skill['Rating'],
          );
        }).toList();
        USN = detailsRes[0]['USN'];
        loaded = true;
      });
    } catch (e) {
      print("Error getting Skills: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      appBar: AppBar(title: Text("Your Skills")),
      body: loaded
          ? (Center(
              child: skills.isEmpty
                  ? Text(
                      "Add Your Skills",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w400,
                      ),
                    )
                  : Column(
                      children: [
                        Expanded(
                          child: ListView.builder(
                            itemCount: skills.length,
                            itemBuilder: (context, idx) {
                              final skill = skills[idx];
                              return Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: ListTile(
                                  title: Text(
                                    skill.SkillName,
                                    style: TextStyle(fontSize: 24),
                                  ),
                                  subtitle: Text(
                                    skill.Rating.toString(),
                                    style: TextStyle(fontSize: 18),
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(6),
                                    side: BorderSide(
                                      color: Colors.blueGrey,
                                      width: 1.5,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
            ))
          : Center(child: spinkit),

      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            barrierDismissible: false,
            context: context,
            builder: (context) {
              return AlertDialog(
                icon: Icon(Icons.add_box_rounded),
                title: Text("Add Skill"),
                content: Column(
                  mainAxisSize: MainAxisSize.min,

                  children: [
                    TextField(
                      decoration: InputDecoration(
                        hint: Text("Enter Skill Name"),
                      ),
                      keyboardType: TextInputType.text,
                      controller: skillNameController,
                    ),
                    TextField(
                      decoration: InputDecoration(
                        hint: Text("Enter Skill Rating on 0.0-5.0"),
                      ),
                      keyboardType: TextInputType.number,
                      controller: ratingController,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                          RegExp(r'^\d*\.?\d*'),
                        ), // Only allows 0-9
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
                      try {
                        if (skillNameController.text.isEmpty ||
                            ratingController.text.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Fill All Fields")),
                          );
                          return;
                        }

                        await supabase.from("Skills").insert({
                          "S_USN": USN,
                          "Skill_Name": skillNameController.text,
                          "Rating": double.parse(ratingController.text),
                        });
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Successfully Added!"),
                              backgroundColor: Colors.green,
                              duration: Duration(milliseconds: 400),
                            ),
                          );
                        }

                        loaded = false;
                        _getSkills();
                        if (context.mounted) {
                          Navigator.of(context).pop();
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Skills Add Error: $e"),
                              backgroundColor: Colors.red,
                              duration: Duration(milliseconds: 900),
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
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
