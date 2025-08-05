# 测试数据使用指南

这个测试数据基于你提供的示例问答生成，用于调试和样式调整。

## 🎯 快速开始

### 1. 生成测试数据

```bash
# 生成完整的测试动画（4个场景）
python test_generator.py

# 生成简单测试场景（1个场景，用于快速调试）
python test_generator.py simple
```

### 2. 生成的文件

- `test_output.html` - 需要静态文件支持的版本
- `test_output_standalone.html` - 独立版本，包含所有CSS和JS
- `test_animation_data.json` - 原始数据（JSON格式）
- `simple_test.html` - 简单测试场景

## 📊 测试数据内容

### 完整测试数据包含4个场景：

1. **经典物理学的困惑** (dual布局)

   - 对比经典预期 vs 实际观察
   - 展示螺旋坠落 vs 稳定轨道

2. **量子力学中的电子概率云** (single布局)

   - 大尺寸展示概率密度分布
   - 动态概率云动画效果

3. **概率密度 vs 径向概率分布** (dual布局)

   - 两个图表对比不同概念
   - 数学曲线可视化

4. **体积效应的可视化解释** (mixed布局)
   - 主区域：体积对比图
   - 辅助区域：数学公式
   - 底部：结论总结

## 🎨 样式调试建议

### 测试不同布局

```python
# 在 test_data.py 中修改布局类型
layout=LayoutConfig(
    type="single",  # 改为 "dual", "triple", "vertical", "mixed"
    distribution="50-50",
    direction="horizontal",
    reasoning="测试不同布局"
)
```

### 测试SVG缩放

```python
# 修改viewBox测试不同比例
content="""<svg viewBox="0 0 800 400" xmlns="...">  # 宽矩形
content="""<svg viewBox="0 0 400 800" xmlns="...">  # 高矩形
content="""<svg viewBox="0 0 400 400" xmlns="...">  # 正方形
```

### 测试CSS样式

1. 修改 `static/css/animation.css`
2. 重新运行 `python test_generator.py`
3. 刷新浏览器查看效果

## 🔧 调试工具

### 在浏览器中调试

1. 打开生成的HTML文件
2. 按F12打开开发者工具
3. 修改CSS实时查看效果
4. 复制修改后的CSS到源文件

### 键盘快捷键

- `←/→` 箭头键：切换场景
- `空格键`：下一个场景
- `Esc`：停止自动播放

## 📝 自定义测试数据

### 修改现有场景

编辑 `test_data.py` 中的场景内容：

```python
ContentArea(
    area_id="your_test_area",
    grid_position="1 / 1 / 2 / 2",  # CSS Grid位置
    content_type="svg",             # "svg", "html", "text"
    title="测试标题",
    content="""你的SVG或HTML内容""",
    caption="说明文字"
)
```

### 添加新场景

```python
new_scene = Scene(
    scene_id="test_scene_5",
    title="新测试场景",
    layout=LayoutConfig(
        type="triple",  # 选择布局类型
        reasoning="测试三列布局"
    ),
    content_areas=[...],  # 添加内容区域
    explanation="场景说明",
    script="视频脚本"
)

# 添加到scenes列表中
scenes=[scene1, scene2, scene3, scene4, new_scene]
```

## 🐛 常见问题

### Q: HTML文件打开后样式不正确

A: 使用 `test_output_standalone.html`，它包含所有CSS内联

### Q: SVG动画不显示

A: 检查SVG语法，确保 `xmlns="http://www.w3.org/2000/svg"` 正确

### Q: 场景切换不工作

A: 检查 `scene_id` 是否唯一，JavaScript是否正确加载

### Q: 网格布局错乱

A: 检查 `grid-position` 格式，应该是 "row-start / col-start / row-end / col-end"

## 🚀 进阶使用

### 批量测试不同布局

```python
layouts = ["single", "dual", "triple", "vertical", "mixed"]
for layout in layouts:
    # 生成每种布局的测试文件
    generate_layout_test(layout)
```

### 性能测试

```python
# 生成大量场景测试性能
scenes = [create_test_scene(i) for i in range(20)]
```

### 响应式测试

在浏览器中调整窗口大小，测试不同屏幕尺寸下的效果。

## 📚 相关文件

- `test_data.py` - 测试数据定义
- `test_generator.py` - HTML生成器
- `models.py` - 数据模型定义
- `static/css/animation.css` - 动画样式
- `static/js/animation.js` - 交互逻辑
- `templates/animation.html` - HTML模板
