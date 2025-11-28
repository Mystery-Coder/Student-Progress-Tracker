import 'package:flutter/material.dart';
import 'package:student_progress_app/routes/home.dart';
import 'package:student_progress_app/routes/tabs.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  await Supabase.initialize(url: '...', anonKey: '...');
  runApp(AppRoot());
}

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: false, primarySwatch: Colors.blue),
      initialRoute: "/home",
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case Home.routeName:
            {
              return MaterialPageRoute(builder: (context) => Home());
            }
          case Tabs.routeName:
            {
              return MaterialPageRoute(builder: (context) => Home());
            }
          default:
            {
              return _errorRoute();
            }
        }
      },
    );
  }
}

Route<dynamic> _errorRoute() {
  return MaterialPageRoute(
    builder: (_) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(
          child: Text('Something went wrong with the navigation!'),
        ),
      );
    },
  );
}
