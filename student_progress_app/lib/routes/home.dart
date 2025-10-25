import 'package:flutter/material.dart';

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            "Student Grades",
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          backgroundColor: Colors.blue,
          centerTitle: true,
        ),
        body: TabBarView(
          controller: _tabController,
          children: const [Center(child: Text("Page to display results"))],
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
