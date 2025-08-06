#!/usr/bin/env python3
"""
测试生成器 - 用于快速测试和调试
"""

import json
from pathlib import Path

from animation_generator import AnimationGenerator
from models import AnimationData, GenerationRequest, StyleConfig


def create_test_data():
    """创建测试用的静态动画数据"""
    from models import AnimationData, Scene

    test_scenes = [
        Scene(
            scene_id="scene1",
            title="经典物理学的困惑",
            svg_content="""<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="800" height="600" fill="#f8fafc"/>
  
  <!-- 原子核 -->
  <circle cx="400" cy="300" r="25" fill="#ef4444" stroke="#dc2626" stroke-width="3"/>
  <text x="400" y="250" text-anchor="middle" font-size="18" font-weight="bold" fill="#1f2937">原子核 (+)</text>
  
  <!-- 经典预期：螺旋轨道 -->
  <path d="M 600 300 Q 580 250 550 300 Q 520 350 480 300 Q 450 250 420 300" 
        fill="none" stroke="#3b82f6" stroke-width="4" opacity="0.7" stroke-dasharray="8,4"/>
  
  <!-- 电子 -->
  <circle cx="600" cy="300" r="12" fill="#3b82f6">
    <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
      <mpath href="#spiral"/>
    </animateMotion>
  </circle>
  
  <!-- 螺旋路径 -->
  <defs>
    <path id="spiral" d="M 600 300 Q 580 250 550 300 Q 520 350 480 300 Q 450 250 425 300"/>
  </defs>
  
  <!-- 能量辐射箭头 -->
  <g stroke="#f59e0b" stroke-width="3" fill="#f59e0b" opacity="0.8">
    <line x1="550" y1="250" x2="530" y2="230" marker-end="url(#arrow)"/>
    <line x1="480" y1="350" x2="460" y2="370" marker-end="url(#arrow)"/>
    <text x="500" y="200" text-anchor="middle" font-size="16" font-weight="bold" fill="#f59e0b">能量辐射</text>
  </g>
  
  <!-- 箭头标记 -->
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b"/>
    </marker>
  </defs>
  
  <!-- 底部说明 -->
  <text x="400" y="550" text-anchor="middle" font-size="20" font-weight="bold" fill="#dc2626">
    经典预测：电子应该螺旋坠落！
  </text>
</svg>""",
            explanation="经典物理学预测电子会因辐射能量而螺旋坠入原子核，但实际观察显示电子保持稳定轨道。",
        ),
        Scene(
            scene_id="scene2",
            title="量子力学的概率云",
            svg_content="""<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="800" height="600" fill="#f8fafc"/>
  
  <!-- 概率云渐变定义 -->
  <defs>
    <radialGradient id="prob" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.8"/>
      <stop offset="30%" style="stop-color:#f97316;stop-opacity:0.6"/>
      <stop offset="50%" style="stop-color:#eab308;stop-opacity:0.4"/>
      <stop offset="70%" style="stop-color:#22c55e;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1"/>
    </radialGradient>
  </defs>
  
  <!-- 原子核 -->
  <circle cx="400" cy="300" r="20" fill="#1f2937" stroke="#000" stroke-width="2"/>
  <text x="400" y="270" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">核</text>
  
  <!-- 概率云 -->
  <circle cx="400" cy="300" r="180" fill="url(#prob)">
    <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 概率密度等高线 -->
  <circle cx="400" cy="300" r="50" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.7"/>
  <circle cx="400" cy="300" r="90" fill="none" stroke="#f97316" stroke-width="2" opacity="0.5"/>
  <circle cx="400" cy="300" r="130" fill="none" stroke="#eab308" stroke-width="2" opacity="0.4"/>
  
  <!-- 标注 -->
  <text x="450" y="280" font-size="14" font-weight="bold" fill="#ef4444">高概率</text>
  <text x="490" y="300" font-size="14" font-weight="bold" fill="#f97316">中概率</text>
  <text x="530" y="320" font-size="14" font-weight="bold" fill="#eab308">低概率</text>
  
  <!-- 中心标识 -->
  <text x="400" y="350" text-anchor="middle" font-size="16" font-weight="bold" fill="#ef4444">
    |Ψ|² 最大值
  </text>
  
  <!-- 底部说明 -->
  <text x="400" y="550" text-anchor="middle" font-size="20" font-weight="bold" fill="#059669">
    电子概率密度在原子核中心最高
  </text>
</svg>""",
            explanation="在量子力学中，电子以概率云形式存在，概率密度在原子核中心达到最大值。",
        ),
    ]

    return AnimationData(
        question="为什么电子不会掉入原子核？",
        title="量子力学解释：电子的稳定性",
        total_scenes=2,
        scenes=test_scenes,
        style=StyleConfig(),
    )


def test_with_real_llm():
    """使用真实LLM进行测试"""
    print("🧪 开始LLM生成测试...")

    try:
        # 创建生成器
        generator = AnimationGenerator()

        # 创建测试请求
        request = GenerationRequest(
            question="为什么电子不会掉入原子核？",
            style=StyleConfig(
                primary_color="#2196F3", background="dark", font_size="medium"
            ),
        )

        # 生成动画
        print("⏳ 正在生成动画数据...")
        result = generator.generate(request)

        # 保存结果
        output_file = "test_output_real.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result.model_dump(), f, ensure_ascii=False, indent=2)

        print(f"✅ 生成成功！")
        print(f"📄 输出文件: {output_file}")
        print(f"🎬 动画标题: {result.title}")
        print(f"📊 场景数量: {result.total_scenes}")

        for i, scene in enumerate(result.scenes, 1):
            print(f"   {i}. {scene.title}")

        return result

    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")
        return None


def test_with_static_data():
    """使用静态测试数据"""
    print("🧪 开始静态数据测试...")

    # 创建测试数据
    test_data = create_test_data()

    # 保存为JSON
    output_file = "test_output_static.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(test_data.model_dump(), f, ensure_ascii=False, indent=2)

    print(f"✅ 静态测试数据生成成功！")
    print(f"📄 输出文件: {output_file}")
    print(f"🎬 动画标题: {test_data.title}")
    print(f"📊 场景数量: {test_data.total_scenes}")

    return test_data


def create_test_html(animation_data: "AnimationData"):
    """创建测试HTML文件"""

    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试 - {animation_data.title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            color: #1f2937;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
        }}
        .scene {{
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }}
        .scene-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
        }}
        .scene-title {{
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }}
        .scene-counter {{
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.875rem;
            font-weight: 600;
        }}
        .svg-container {{
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
        }}
        .explanation {{
            background: #eff6ff;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            font-size: 1.1rem;
            line-height: 1.6;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1 style="text-align: center; margin-bottom: 30px; color: #1f2937;">
            🧪 {animation_data.title}
        </h1>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <strong>📋 测试信息</strong><br>
            问题: {animation_data.question[:50]}...<br>
            场景数量: {animation_data.total_scenes}
        </div>
"""

    # 添加每个场景
    for i, scene in enumerate(animation_data.scenes, 1):
        html_content += f"""
        <div class="scene">
            <div class="scene-header">
                <h2 class="scene-title">{scene.title}</h2>
                <span class="scene-counter">{i}/{animation_data.total_scenes}</span>
            </div>
            
            <div class="svg-container">
                {scene.svg_content}
            </div>
            
            <div class="explanation">
                💡 {scene.explanation}
            </div>
        </div>
        """

    html_content += """
    </div>
</body>
</html>
"""

    # 保存HTML文件
    html_file = "test_output.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"📄 测试HTML文件已生成: {html_file}")
    print(f"🌐 在浏览器中打开: file://{Path(html_file).absolute()}")


def main():
    """主函数"""
    import sys

    print("🚀 教育动画生成器测试工具")
    print("=" * 50)

    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
    else:
        print("请选择测试模式:")
        print("1. static  - 静态测试数据")
        print("2. llm     - 真实LLM生成")
        choice = input("输入选择 (1/2): ").strip()
        mode = "static" if choice == "1" else "llm"

    if mode == "static":
        # 静态数据测试
        animation_data = test_with_static_data()
        if animation_data:
            create_test_html(animation_data)

    elif mode == "llm":
        # LLM生成测试
        animation_data = test_with_real_llm()
        if animation_data:
            create_test_html(animation_data)

    else:
        print("❌ 无效的模式，请选择 'static' 或 'llm'")
        return

    print("\n🎉 测试完成！")


if __name__ == "__main__":
    main()
