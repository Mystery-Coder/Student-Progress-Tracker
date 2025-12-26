// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/types.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class GroupsTab extends StatefulWidget {
  const GroupsTab({super.key});

  @override
  State<GroupsTab> createState() => _GroupsTabState();
}

class _GroupsTabState extends State<GroupsTab>
    with AutomaticKeepAliveClientMixin {
  bool loaded = true;
  List<GroupDetails> groups = [];

  final spinkit = SpinKitDualRing(color: Colors.amberAccent);
  final supabase = Supabase.instance.client;
  late final user = supabase.auth.currentUser;

  @override
  void initState() {
    super.initState();
    _getGroupDetails();
  }

  @override
  bool get wantKeepAlive => true;

  void _getGroupDetails() async {
    try {
      final res = await supabase.rpc(
        'get_student_groups_from_id',
        params: {'id_of_student': user!.id},
      );
      if (res.isNotEmpty) {
        setState(() {
          groups = res.map<GroupDetails>((group) {
            return GroupDetails(
              GroupID: group['Group_ID'],
              GroupName: group['Group_Name'],
            );
          }).toList();
        });
      }
    } catch (e) {
      print("Group Details Error: $e");
    }
  }

  //Number of Groups check
  @override
  Widget build(BuildContext context) {
    super.build(context);
    return loaded
        ? (Center(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    "Groups You're a Part Of",
                    style: TextStyle(fontWeight: FontWeight.w300, fontSize: 24),
                  ),
                ),
                groups.isEmpty
                    ? Center(
                        child: Text(
                          "No groups found",
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                      )
                    : Expanded(
                        child: ListView.builder(
                          itemCount: groups.length,
                          itemBuilder: (context, index) {
                            final group = groups[index];
                            return ListTile(
                              subtitle: Text(group.GroupID),
                              title: Text(group.GroupName),
                              leading: Icon(Icons.group),
                            );
                          },
                        ),
                      ),
              ],
            ),
          ))
        : Center(child: spinkit);
  }
}
