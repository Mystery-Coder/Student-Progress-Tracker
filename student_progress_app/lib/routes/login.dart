import 'package:flutter/material.dart';
import 'package:student_progress_app/routes/tabs.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

//Signin and Signup
class Login extends StatefulWidget {
  const Login({super.key});
  static const routeName = "/login";
  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  bool signIn = false;

  void toggleView() {
    setState(() {
      signIn = !signIn;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(title: Text("Student Progress Tracker")),

        body: Center(
          child: (signIn)
              ? SignIn(toggleView: toggleView)
              : SignUp(toggleView: toggleView),
        ),
      ),
    );
  }
}

//SignUp Widget
class SignUp extends StatefulWidget {
  final VoidCallback toggleView;
  const SignUp({super.key, required this.toggleView});

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  String gender = "Male";
  TextEditingController name = TextEditingController();
  TextEditingController usn = TextEditingController();
  TextEditingController email = TextEditingController();
  TextEditingController password = TextEditingController();
  TextEditingController motherName = TextEditingController();
  TextEditingController fatherName = TextEditingController();
  // ignore: non_constant_identifier_names
  TextEditingController DOB = TextEditingController();
  TextEditingController phone = TextEditingController();

  final supabase = Supabase.instance.client;

  @override
  Widget build(BuildContext context) {
    return Column(
      // mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Full Name")),
            controller: name,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("USN")),
            controller: usn,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Email")),
            controller: email,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Password")),
            controller: password,
            obscureText: true,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Mother Name")),
            controller: motherName,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Father Name")),
            controller: fatherName,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("DOB-DD/MM/YYYY")),
            controller: DOB,
            keyboardType: TextInputType.datetime,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Phone")),
            keyboardType: TextInputType.number,
            controller: phone,
          ),
        ),
        DropdownButton<String>(
          value: gender,
          hint: Text("Gender"),
          items: [
            DropdownMenuItem(value: "Male", child: Text("Male")),
            DropdownMenuItem(value: "Female", child: Text("Female")),
          ],
          onChanged: (value) {
            setState(() {
              gender = value!;
            });
          },
        ),
        OutlinedButton(
          onPressed: () async {
            if (name.text.isEmpty ||
                usn.text.isEmpty ||
                email.text.isEmpty ||
                phone.text.isEmpty ||
                motherName.text.isEmpty ||
                fatherName.text.isEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Fill all Fields"),
                  duration: Duration(milliseconds: 450),
                ),
              );
              return;
            }

            var res = await supabase.auth.signUp(
              email: email.text,
              password: password.text,
            );
            final Session? session = res.session;
            final User? user = res.user;

            if (session != null) {
              await supabase.from("STUDENT").insert({
                "user_id": user?.id,
                "USN": usn.text,
                "First_Name": name.text.substring(0, name.text.indexOf(" ")),
                "Last_Name": name.text.substring(name.text.indexOf(" ") + 1),
                "Date_born": DOB.text,
                "Sex": gender,
                "Father_Name": fatherName.text,
                "Mother_Name": motherName.text,
                "Phone_No": phone.text,
              });
            }
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Signed Up! Login with Email"),
                  duration: Duration(milliseconds: 500),
                ),
              );
              widget.toggleView();
            }
          },
          child: Text("Sign Up"),
        ),
        TextButton(
          onPressed: widget.toggleView,
          child: Text("Already have an account? Sign In"),
        ),
      ],
    );
  }
}

//SignIn Widget
class SignIn extends StatefulWidget {
  final VoidCallback toggleView;
  const SignIn({super.key, required this.toggleView});

  @override
  State<SignIn> createState() => _SignInState();
}

class _SignInState extends State<SignIn> with SingleTickerProviderStateMixin {
  TextEditingController email = TextEditingController();
  TextEditingController password = TextEditingController();

  final supabase = Supabase.instance.client;
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,

      children: [
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Email")),
            controller: email,
          ),
        ),
        SizedBox(
          width: 180,
          child: TextField(
            decoration: InputDecoration(hint: Text("Password")),
            obscureText: true,
            controller: password,
          ),
        ),
        OutlinedButton(
          onPressed: () async {
            if (email.text.isEmpty || password.text.isEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Fill all Fields"),
                  duration: Duration(milliseconds: 450),
                ),
              );
              return;
            }

            try {
              var res = await supabase.auth.signInWithPassword(
                email: email.text,
                password: password.text,
              );
              final Session? session = res.session;

              if (session != null) {
                var checkAdmin = await supabase.rpc(
                  "check_admin",
                  params: {"id_of_user": session.user.id},
                );
                if (checkAdmin) {
                  supabase.auth.signOut();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Admin Not Allowed on Mobile"),
                        duration: Duration(milliseconds: 800),
                      ),
                    );
                  }
                  return;
                }
              }

              if (session != null && context.mounted) {
                Navigator.pushReplacementNamed(context, Tabs.routeName);
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text("Login Failed ${e.toString()}"),
                    duration: Duration(milliseconds: 1500),
                  ),
                );
              }
            }
          },
          child: Text("Sign In"),
        ),
        TextButton(
          onPressed: widget.toggleView, // Call the callback
          child: Text("Don't have an account? Sign Up"),
        ),
      ],
    );
  }
}
