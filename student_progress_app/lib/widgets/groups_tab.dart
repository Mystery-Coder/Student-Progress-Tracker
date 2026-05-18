import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:student_progress_app/providers/groups_providers.dart';

class GroupsTab extends ConsumerWidget {
  const GroupsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groupsAsync = ref.watch(groupsProvider);
    final spinkit = const SpinKitDualRing(color: Colors.amberAccent);

    return groupsAsync.when(
      loading: () => Center(child: spinkit),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, color: Colors.red, size: 48),
            const SizedBox(height: 16),
            Text('Error: ${error.toString()}'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => ref.refresh(groupsProvider),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
      data: (groups) => Center(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                "Groups You're a Part Of",
                style: TextStyle(fontWeight: FontWeight.w300, fontSize: 24),
              ),
            ),
            groups.isEmpty
                ? const Center(
                    child: Text(
                      "No groups found",
                      style: TextStyle(fontSize: 18, color: Colors.grey),
                    ),
                  )
                : Expanded(
                    child: ListView.builder(
                      itemCount: groups.length,
                      itemBuilder: (context, index) {
                        final group = groups[index];
                        return ListTile(
                          subtitle: Text(group.GroupID),
                          title: Text(group.GroupName),
                          leading: const Icon(Icons.group),
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
