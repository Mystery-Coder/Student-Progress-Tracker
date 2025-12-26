import 'package:flutter/material.dart';
import 'package:student_progress_app/routes/login.dart';
import 'package:student_progress_app/routes/skills.dart';
import 'package:student_progress_app/types.dart';
import 'package:student_progress_app/widgets/details_tab.dart';
import 'package:student_progress_app/widgets/groups_tab.dart';
import 'package:student_progress_app/widgets/model_tab.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class Tabs extends StatefulWidget {
  const Tabs({super.key});
  static const routeName = "/tabs";

  @override
  State<Tabs> createState() => _TabsState();
}

class _TabsState extends State<Tabs> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final supabase = Supabase.instance.client;
  late final session = supabase.auth.currentSession;
  late final user = session?.user;
  // ignore: non_constant_identifier_names
  String USN = "";
  StudentDetails studentDetails = StudentDetails(
    USN: "",
    PUC: 0,
    SSLC: 0,
    noOfHackathons: 0,
    noOfInternships: 0,
    noOfProjects: 0,
  );

  @override
  initState() {
    super.initState();
    _getDetails();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _getDetails() async {
    try {
      final data = await supabase
          .from("STUDENT")
          .select("USN")
          .eq("user_id", user!.id);

      setState(() {
        USN = data[0]["USN"];
      });
    } catch (e) {
      print("details error: $e");
    }
    // setState(() {
    //   USN = data[0]["USN"];
    // });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(color: Colors.blue),
                child: Text(
                  'Menu',
                  style: TextStyle(color: Colors.white, fontSize: 24),
                ),
              ),
              ListTile(
                leading: Icon(Icons.emoji_events),
                title: Text("Skills"),
                onTap: () {
                  Navigator.pushNamed(context, Skills.routeName);
                },
              ),
              ListTile(
                leading: Icon(Icons.logout),
                title: Text("Logout"),
                onTap: () async {
                  try {
                    await supabase.auth.signOut();
                    if (context.mounted) {
                      Navigator.pushReplacementNamed(context, Login.routeName);
                    }
                  } catch (e) {
                    print("Caught error: $e");
                  }
                },
              ),
            ],
          ),
        ),
        appBar: AppBar(
          title: Text(USN, style: TextStyle(fontWeight: FontWeight.w500)),
          backgroundColor: Colors.blue,
          centerTitle: true,
        ),
        body: TabBarView(
          controller: _tabController,
          children: [DetailsTab(), ModelTab(), GroupsTab()],
        ),
        bottomNavigationBar: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.info)),
            Tab(icon: Icon(Icons.memory)),
            Tab(icon: Icon(Icons.group)),
          ],
          labelColor: Colors.blue,
        ),
      ),
    );
  }
}
