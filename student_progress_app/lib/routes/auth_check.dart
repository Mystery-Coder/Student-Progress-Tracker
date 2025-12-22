import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/routes/login.dart';
import 'package:student_progress_app/routes/tabs.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthCheck extends StatefulWidget {
  const AuthCheck({super.key});
  static const routeName = "/";

  @override
  State<AuthCheck> createState() => _AuthCheckState();
}

class _AuthCheckState extends State<AuthCheck> {
  final supabase = Supabase.instance.client;

  @override
  void initState() {
    super.initState();
    _authCheck();
  }

  Future<void> _authCheck() async {
    await Future.delayed(Duration(milliseconds: 500));
    Session? session = Supabase.instance.client.auth.currentSession;

    if (session != null) {
      if (mounted) {
        Navigator.pushReplacementNamed(context, Tabs.routeName);
      }
    } else {
      if (mounted) {
        Navigator.pushReplacementNamed(context, Login.routeName);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: SpinKitFoldingCube(size: 50, color: Colors.blue)),
    );
  }
}
