import 'package:flutter/material.dart';
import 'package:student_progress_app/routes/login.dart';
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

  @override
  initState() {
    super.initState();
    _getUSN();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _getUSN() async {
    var data = await supabase
        .from("STUDENT")
        .select('USN')
        .eq("user_id", user!.id);
    setState(() {
      USN = data[0]["USN"];
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        drawer: Drawer(
          child: Column(
            children: [
              TextButton(
                onPressed: () async {
                  await supabase.auth.signOut();
                  if (context.mounted) {
                    Navigator.pushReplacementNamed(context, Login.routeName);
                  }
                },
                child: Text("Logout"),
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
          children: const [
            Center(child: Text("Page to display results")),
            Center(child: Text("Page to display results")),
          ],
        ),
        bottomNavigationBar: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.add)),
            Tab(icon: Icon(Icons.folder)),
          ],
          labelColor: Colors.blue,
        ),
      ),
    );
  }
}
