import 'package:flutter/material.dart';

import '../../domain/workspace.dart';

abstract final class AppColors {
  static const canvas = Color(0xFFF6F7F9);
  static const surface = Color(0xFFFFFFFF);
  static const ink = Color(0xFF17202A);
  static const muted = Color(0xFF5C6673);
  static const line = Color(0xFFDDE2E8);
  static const lineStrong = Color(0xFF8A95A3);
  static const brand = Color(0xFF3157E5);
  static const brandSoft = Color(0xFFE8EDFF);
  static const mint = Color(0xFFDDF5E7);
  static const butter = Color(0xFFFFF1BD);
  static const coral = Color(0xFFF36F5D);
  static const danger = Color(0xFFB43C2D);
}

ThemeData buildTheme() {
  final scheme =
      ColorScheme.fromSeed(
        seedColor: AppColors.brand,
        brightness: Brightness.light,
        surface: AppColors.surface,
      ).copyWith(
        primary: AppColors.brand,
        onPrimary: Colors.white,
        surface: AppColors.surface,
        onSurface: AppColors.ink,
        error: AppColors.danger,
        outline: AppColors.lineStrong,
        outlineVariant: AppColors.line,
      );
  const familyFallback = ['Segoe UI', 'SF Pro Text', 'Arial'];
  final baseText = ThemeData.light().textTheme.apply(
    bodyColor: AppColors.ink,
    displayColor: AppColors.ink,
    fontFamilyFallback: familyFallback,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.canvas,
    textTheme: baseText.copyWith(
      displayLarge: baseText.displayLarge?.copyWith(
        fontSize: 40,
        height: 1.08,
        fontWeight: FontWeight.w700,
        letterSpacing: -1.5,
      ),
      headlineLarge: baseText.headlineLarge?.copyWith(
        fontSize: 28,
        height: 1.16,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.7,
      ),
      headlineSmall: baseText.headlineSmall?.copyWith(
        fontSize: 20,
        height: 1.25,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.2,
      ),
      titleMedium: baseText.titleMedium?.copyWith(
        fontSize: 16,
        height: 1.35,
        fontWeight: FontWeight.w700,
      ),
      bodyLarge: baseText.bodyLarge?.copyWith(fontSize: 16, height: 1.5),
      bodyMedium: baseText.bodyMedium?.copyWith(fontSize: 14, height: 1.45),
      labelLarge: baseText.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      labelStyle: const TextStyle(color: AppColors.muted),
      hintStyle: const TextStyle(color: AppColors.muted),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.lineStrong),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.brand, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.danger),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.danger, width: 2),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        minimumSize: const Size(44, 48),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(44, 48),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
        side: const BorderSide(color: AppColors.lineStrong),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        minimumSize: const Size(44, 44),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.ink,
      contentTextStyle: const TextStyle(color: Colors.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    dividerColor: AppColors.line,
    focusColor: AppColors.brandSoft,
  );
}

Color moduleColor(ModuleTone tone) => switch (tone) {
  ModuleTone.blue => const Color(0xFF3157E5),
  ModuleTone.mint => const Color(0xFF2D7A55),
  ModuleTone.violet => const Color(0xFF7555B7),
  ModuleTone.coral => const Color(0xFFC94C3C),
  ModuleTone.amber => const Color(0xFF9A6500),
};

Color moduleBackground(ModuleTone tone) => switch (tone) {
  ModuleTone.blue => AppColors.brandSoft,
  ModuleTone.mint => AppColors.mint,
  ModuleTone.violet => const Color(0xFFF0E9FF),
  ModuleTone.coral => const Color(0xFFFFE7E2),
  ModuleTone.amber => AppColors.butter,
};
