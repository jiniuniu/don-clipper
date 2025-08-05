"""
测试HTML生成器
用于快速生成测试HTML文件，方便调试样式
"""

from pathlib import Path

from fastapi.templating import Jinja2Templates
from test_data import create_test_animation_data


def generate_test_html():
    """生成测试HTML文件"""

    # 创建测试数据
    animation_data = create_test_animation_data()

    # 设置模板
    templates = Jinja2Templates(directory="templates")

    # 渲染HTML
    html_content = templates.get_template("animation.html").render(
        animation_data=animation_data
    )

    # 保存到文件
    output_path = Path("test_output.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✅ 测试HTML已生成: {output_path.absolute()}")
    print(f"🌐 在浏览器中打开: file://{output_path.absolute()}")
    print(f"📊 包含 {animation_data.total_scenes} 个测试场景")

    # 也生成不依赖静态文件的独立版本
    generate_standalone_html(animation_data)

    return str(output_path.absolute())


def generate_standalone_html(animation_data):
    """生成包含内联CSS和JS的独立HTML文件"""

    # 读取CSS文件
    css_content = ""
    try:
        with open("static/css/animation.css", "r", encoding="utf-8") as f:
            css_content = f.read()
    except FileNotFoundError:
        print("⚠️  未找到 static/css/animation.css")

    # 读取JS文件
    js_content = ""
    try:
        with open("static/js/animation.js", "r", encoding="utf-8") as f:
            js_content = f.read()
    except FileNotFoundError:
        print("⚠️  未找到 static/js/animation.js")

    # 生成独立HTML
    standalone_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{animation_data.animation_title}</title>
    <style>
{css_content}
    </style>
</head>
<body>
    <div class="container">
        <h1>{animation_data.animation_title}</h1>
        
        <div class="controls">"""

    # 添加场景按钮
    for i, scene in enumerate(animation_data.scenes, 1):
        standalone_html += f"""
            <button onclick="showScene('{scene.scene_id}')">{i}. {scene.title}</button>"""

    standalone_html += """
            <button onclick="toggleScripts()">显示/隐藏脚本</button>
            <button onclick="playAll()">播放全部</button>
        </div>"""

    # 添加所有场景
    for scene in animation_data.scenes:
        standalone_html += f"""
        <div id="{scene.scene_id}" class="scene layout-{scene.layout.type}">
            <h2>{scene.title}</h2>
            <div class="scene-content">"""

        # 添加内容区域
        for area in scene.content_areas:
            standalone_html += f"""
                <div class="content-area" style="grid-area: {area.grid_position};">"""

            if area.title:
                standalone_html += f"""
                    <h3>{area.title}</h3>"""

            if area.content_type == "svg":
                standalone_html += area.content
            elif area.content_type == "html":
                standalone_html += area.content
            else:
                standalone_html += f"""
                    <p>{area.content}</p>"""

            if area.caption:
                standalone_html += f"""
                    <small style="color: #ccc; margin-top: 10px;">{area.caption}</small>"""

            standalone_html += """
                </div>"""

        standalone_html += f"""
            </div>
            <div class="explanation">
                <strong>{scene.explanation}</strong>
            </div>
            
            <div class="script-panel" id="script-{scene.scene_id}">
                <strong>视频脚本：</strong> {scene.script}
            </div>
        </div>"""

    # 添加JavaScript
    scene_ids = [scene.scene_id for scene in animation_data.scenes]
    standalone_html += f"""
    </div>

    <script>
        window.sceneIds = {scene_ids};
        {js_content}
    </script>
</body>
</html>"""

    # 保存独立HTML文件
    standalone_path = Path("test_output_standalone.html")
    with open(standalone_path, "w", encoding="utf-8") as f:
        f.write(standalone_html)

    print(f"✅ 独立HTML已生成: {standalone_path.absolute()}")
    print(f"🌐 可直接在浏览器中打开: file://{standalone_path.absolute()}")


def create_simple_test_scene():
    """创建一个简单的测试场景用于快速调试"""
    from models import AnimationData, ContentArea, LayoutConfig, Scene

    simple_scene = Scene(
        scene_id="test_scene",
        title="样式测试场景",
        layout=LayoutConfig(
            type="dual",
            distribution="50-50",
            direction="horizontal",
            reasoning="测试双列布局",
        ),
        content_areas=[
            ContentArea(
                area_id="left_area",
                grid_position="1 / 1 / 2 / 2",
                content_type="svg",
                title="SVG测试",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="300" height="300" fill="#4CAF50" rx="20"/>
  <circle cx="200" cy="200" r="80" fill="#2196F3">
    <animate attributeName="r" values="80;120;80" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="200" y="210" text-anchor="middle" font-size="24" fill="white">测试</text>
</svg>""",
                caption="这是一个SVG测试内容",
            ),
            ContentArea(
                area_id="right_area",
                grid_position="1 / 2 / 2 / 3",
                content_type="html",
                title="HTML测试",
                content="""<div style="padding: 20px; background: linear-gradient(45deg, #FF6B6B, #4ECDC4); border-radius: 10px; color: white; text-align: center;">
  <h3>HTML内容测试</h3>
  <p>这是一个HTML内容区域</p>
  <button onclick="alert('测试按钮')" style="padding: 10px 20px; background: white; color: #333; border: none; border-radius: 5px; cursor: pointer;">点击测试</button>
</div>""",
                caption="这是一个HTML测试内容",
            ),
        ],
        explanation="这是一个用于测试样式的简单场景，包含SVG动画和HTML内容。",
        script="这个场景用于测试各种样式效果，确保布局和动画正常工作。",
    )

    return AnimationData(
        animation_title="样式测试动画", total_scenes=1, scenes=[simple_scene]
    )


def generate_simple_test():
    """生成简单测试HTML"""
    animation_data = create_simple_test_scene()

    # 设置模板
    templates = Jinja2Templates(directory="templates")

    # 渲染HTML
    html_content = templates.get_template("animation.html").render(
        animation_data=animation_data
    )

    # 保存到文件
    output_path = Path("simple_test.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✅ 简单测试HTML已生成: {output_path.absolute()}")
    return str(output_path.absolute())


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "simple":
        # 生成简单测试
        generate_simple_test()
    else:
        # 生成完整测试
        generate_test_html()

    print("\n🎯 使用说明:")
    print("python test_generator.py        # 生成完整测试数据")
    print("python test_generator.py simple # 生成简单测试场景")
