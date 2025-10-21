import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Flutter Demo',
      theme: ThemeData(useMaterial3: false, primarySwatch: Colors.blue),
      // Use a new widget for your home screen
      home: const MyHomePage(),
    );
  }
}

// This new widget's build method has a `context`
// that is BENEATH the MaterialApp, so it can find the theme.
class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.primary,
          title: const Text("Student Progress"),
        ),
        body: const Center(child: Text('My Home Page')),
      ),
    );
  }
}
