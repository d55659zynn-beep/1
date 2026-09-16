import 'dart:math' as math;

import 'dart:ui';

import 'package:flutter/material.dart';

/// 液态玻璃按钮 / 背景动效
///
/// 还原 gsy_flutter_demo · lib/widget/canvas/glass_demo_page.dart 的圆形玻璃按钮，
/// 并叠加「液态高光扫过 + 浮动气泡」动效（对应 liquid_glass_demo.dart 的流动质感）。
///
/// 用法：
/// ```dart
/// LiquidGlassButton(
///   onTap: () {},
///   child: const Icon(Icons.favorite, color: LiquidGlassColors.content, size: 24),
/// )
/// ```

/// 玻璃调色板（使用 ARGB 常量，避免 withOpacity/withAlpha 的版本兼容问题）
class LiquidGlassColors {
  const LiquidGlassColors._();

  static const Color rim = Color(0x38FFFFFF); // 描边 22%
  static const Color top = Color(0x4DFFFFFF); // 玻璃高光 30%
  static const Color bottom = Color(0x1AFFFFFF); // 玻璃暗部 10%
  static const Color sheen = Color(0x66FFFFFF); // 主高光 40%
  static const Color sheenWeak = Color(0x1FFFFFFF); // 次高光 12%
  static const Color specular = Color(0x33FFFFFF); // 顶部镜面 20%
  static const Color content = Color(0xDBFFFFFF); // 内容 86%
  static const Color bubble = Color(0x19FFFFFF); // 气泡 10%
}

class LiquidGlassButton extends StatefulWidget {
  const LiquidGlassButton({
    super.key,
    required this.child,
    this.size = 60,
    this.blur = 8,
    this.highlight = true,
    this.sheenDuration = const Duration(seconds: 3),
    this.onTap,
  });

  /// 按钮内容，一般放 Icon 或文字
  final Widget child;

  /// 直径
  final double size;

  /// 背景模糊 sigma，对应原示例的 ImageFilter.blur(sigmaX: 8)
  final double blur;

  /// 是否开启液态高光扫过动效
  final bool highlight;

  /// 高光旋转一圈的时长
  final Duration sheenDuration;

  final VoidCallback? onTap;

  @override
  State<LiquidGlassButton> createState() => _LiquidGlassButtonState();
}

class _LiquidGlassButtonState extends State<LiquidGlassButton>
    with TickerProviderStateMixin {
  late final AnimationController _pressCtl;
  late final AnimationController _sheenCtl;
  late final Animation<double> _pressAnim;

  @override
  void initState() {
    super.initState();
    _pressCtl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 160),
    );
    _sheenCtl = AnimationController(vsync: this, duration: widget.sheenDuration)
      ..repeat();
    _pressAnim = Tween<double>(begin: 1, end: 0.92).animate(
      CurvedAnimation(parent: _pressCtl, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _pressCtl.dispose();
    _sheenCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => _pressCtl.forward(),
      onTapUp: (_) => _pressCtl.reverse(),
      onTapCancel: _pressCtl.reverse,
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: Listenable.merge([_pressCtl, _sheenCtl]),
        builder: (context, _) {
          return Transform.scale(
            scale: _pressAnim.value,
            child: SizedBox(
              width: widget.size,
              height: widget.size,
              child: ClipOval(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // 1. 真实背景模糊
                    BackdropFilter(
                      filter: ImageFilter.blur(
                        sigmaX: widget.blur,
                        sigmaY: widget.blur,
                      ),
                      child: const SizedBox.expand(),
                    ),
                    // 2. 玻璃底色：白色径向渐变 30% → 10%
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: RadialGradient(
                          center: Alignment(-0.45, -0.5),
                          radius: 1.15,
                          colors: [LiquidGlassColors.top, LiquidGlassColors.bottom],
                        ),
                      ),
                    ),
                    // 3. 液态高光：整圈旋转的扫光
                    if (widget.highlight)
                      Transform.rotate(
                        angle: _sheenCtl.value * 2 * math.pi,
                        child: const DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: SweepGradient(
                              colors: [
                                Colors.transparent,
                                LiquidGlassColors.sheen,
                                Colors.transparent,
                                LiquidGlassColors.sheenWeak,
                                Colors.transparent,
                              ],
                              stops: [0.0, 0.18, 0.42, 0.62, 1.0],
                            ),
                          ),
                        ),
                      ),
                    // 4. 顶部镜面反光
                    Align(
                      alignment: Alignment.topCenter,
                      child: FractionallySizedBox(
                        widthFactor: 1,
                        heightFactor: 0.45,
                        child: DecoratedBox(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                LiquidGlassColors.specular,
                                Colors.transparent,
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    // 5. 1px 白色描边
                    DecoratedBox(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(widget.size / 2),
                        border: Border.all(
                          color: LiquidGlassColors.rim,
                          width: 1,
                        ),
                      ),
                    ),
                    // 6. 内容
                    Center(child: widget.child),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// 液态玻璃背景：跟随时间漂浮的半透明气泡
class LiquidGlassBackdrop extends StatefulWidget {
  const LiquidGlassBackdrop({
    super.key,
    this.bubbleCount = 6,
    this.duration = const Duration(seconds: 6),
  });

  final int bubbleCount;
  final Duration duration;

  @override
  State<LiquidGlassBackdrop> createState() => _LiquidGlassBackdropState();
}

class _LiquidGlassBackdropState extends State<LiquidGlassBackdrop>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctl;

  @override
  void initState() {
    super.initState();
    _ctl = AnimationController(vsync: this, duration: widget.duration)
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: List.generate(widget.bubbleCount, _buildBubble),
    );
  }

  Widget _buildBubble(int index) {
    return AnimatedBuilder(
      animation: _ctl,
      builder: (context, _) {
        final t = _ctl.value * 2 * math.pi + index;
        final offset = math.sin(t) * 50;
        final size = 80.0 + math.sin(t) * 20;
        return Positioned(
          left: 40.0 + index * 60 + offset,
          top: 90.0 + index * 100 + offset,
          child: Container(
            width: size,
            height: size,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [LiquidGlassColors.bubble, Color(0x05FFFFFF)],
              ),
            ),
            child: ClipOval(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0x19FFFFFF),
                      width: 1,
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
