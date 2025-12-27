import 'package:flutter/material.dart';
import 'package:student_progress_app/routes/auth_check.dart';
import 'package:student_progress_app/routes/login.dart';
import 'package:student_progress_app/routes/skills.dart';
import 'package:student_progress_app/routes/tabs.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  await Supabase.initialize(
    url: 'https://ztagrfwdunxdrnvledax.supabase.co',
    anonKey: 'sb_publishable_IjvDDDK4jlzu6sKnGFLauQ_nWQHFCTn',
  );
  runApp(AppRoot());
}

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: false, primarySwatch: Colors.blue),
      initialRoute: AuthCheck.routeName,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case Login.routeName:
            {
              return MaterialPageRoute(builder: (context) => Login());
            }
          case AuthCheck.routeName:
            {
              return MaterialPageRoute(builder: (context) => AuthCheck());
            }
          case Tabs.routeName:
            {
              return MaterialPageRoute(builder: (context) => Tabs());
            }
          case Skills.routeName:
            {
              return MaterialPageRoute(builder: (context) => Skills());
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
