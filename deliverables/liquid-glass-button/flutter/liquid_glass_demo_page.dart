import 'package:flutter/material.dart';

import 'liquid_glass_button.dart';

/// 与 gsy_flutter_demo 中 glass_demo_page.dart 一致的演示页：
/// 彩色渐变背景 + 浮动气泡 + 三个圆形液态玻璃按钮
class LiquidGlassDemoPage extends StatelessWidget {
  const LiquidGlassDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF667eea),
              Color(0xFF764ba2),
              Color(0xFFf093fb),
              Color(0xFFf5576c),
            ],
          ),
        ),
        child: const Stack(
          children: [
            LiquidGlassBackdrop(),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  LiquidGlassButton(
                    child: Icon(
                      Icons.favorite,
                      color: LiquidGlassColors.content,
                      size: 24,
                    ),
                  ),
                  SizedBox(width: 20),
                  LiquidGlassButton(
                    child: Icon(
                      Icons.star,
                      color: LiquidGlassColors.content,
                      size: 24,
                    ),
                  ),
                  SizedBox(width: 20),
                  LiquidGlassButton(
                    child: Icon(
                      Icons.share,
                      color: LiquidGlassColors.content,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
