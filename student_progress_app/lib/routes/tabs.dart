import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_progress_app/providers/auth_providers.dart';
import 'package:student_progress_app/providers/student_providers.dart';
import 'package:student_progress_app/routes/login.dart';
import 'package:student_progress_app/routes/skills.dart';
import 'package:student_progress_app/widgets/academics_tab.dart';
import 'package:student_progress_app/widgets/details_tab.dart';
import 'package:student_progress_app/widgets/groups_tab.dart';
import 'package:student_progress_app/widgets/model_tab.dart';

class Tabs extends ConsumerStatefulWidget {
  const Tabs({super.key});
  static const routeName = "/tabs";

  @override
  ConsumerState<Tabs> createState() => _TabsState();
}

class _TabsState extends ConsumerState<Tabs>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final usnAsync = ref.watch(usnProvider);

    return SafeArea(
      child: Scaffold(
        drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const DrawerHeader(
                decoration: BoxDecoration(color: Colors.blue),
                child: Text(
                  'Menu',
                  style: TextStyle(color: Colors.white, fontSize: 24),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.emoji_events),
                title: const Text("Skills"),
                onTap: () {
                  Navigator.pushNamed(context, Skills.routeName);
                },
              ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text("Logout"),
                onTap: () async {
                  try {
                    final supabase = ref.read(supabaseProvider);
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
          title: usnAsync.when(
            data: (usn) =>
                Text(usn, style: const TextStyle(fontWeight: FontWeight.w500)),
            loading: () => const Text(
              'Loading...',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            error: (_, __) => const Text(
              'Error',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          backgroundColor: Colors.blue,
          centerTitle: true,
        ),
        body: TabBarView(
          controller: _tabController,
          children: [AcademicsTab(), DetailsTab(), ModelTab(), GroupsTab()],
        ),
        bottomNavigationBar: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.school_outlined)),
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
