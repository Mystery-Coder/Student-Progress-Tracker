import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/types.dart';

class GroupsTab extends StatefulWidget {
  const GroupsTab({super.key});

  @override
  State<GroupsTab> createState() => _GroupsTabState();
}

class _GroupsTabState extends State<GroupsTab> {
  bool loaded = true;
  List<GroupDetails> groups = [];

  final spinkit = SpinKitDualRing(color: Colors.amberAccent);

  @override
  Widget build(BuildContext context) {
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
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        itemCount: groups.length,
                        itemBuilder: (context, index) {
                          final group = groups[index];
                          return ListTile(
                            title: Text(group.GroupID),
                            subtitle: Text(group.GroupName),
                            leading: Icon(Icons.group),
                          );
                        },
                      ),
              ],
            ),
          ))
        : Center(child: spinkit);
  }
}
