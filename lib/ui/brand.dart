import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

class BrandMark extends StatelessWidget {
  const BrandMark({this.size = 40, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'UniX',
      image: true,
      child: ExcludeSemantics(
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: AppColors.brand,
            borderRadius: BorderRadius.circular(size * .24),
          ),
          child: Stack(
            children: [
              Center(
                child: Text(
                  'U',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: size * .48,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Positioned(
                top: size * .14,
                right: size * .14,
                child: Container(
                  width: size * .13,
                  height: size * .13,
                  decoration: const BoxDecoration(
                    color: AppColors.butter,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BrandLockup extends StatelessWidget {
  const BrandLockup({this.compact = false, super.key});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        BrandMark(size: compact ? 38 : 42),
        if (!compact) ...[
          const SizedBox(width: 12),
          Text('UniX', style: Theme.of(context).textTheme.headlineSmall),
        ],
      ],
    );
  }
}
