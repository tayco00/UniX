import 'package:flutter/material.dart';

class PageFrame extends StatelessWidget {
  const PageFrame({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final horizontal = MediaQuery.sizeOf(context).width < 700 ? 20.0 : 40.0;
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(horizontal, 40, horizontal, 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1120),
          child: child,
        ),
      ),
    );
  }
}
