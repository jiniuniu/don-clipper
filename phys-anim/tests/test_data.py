"""
测试数据生成器
用于生成AnimationData测试数据，方便调试和样式调整
"""

from models import AnimationData, ContentArea, LayoutConfig, Scene


def create_test_animation_data() -> AnimationData:
    """
    基于示例问答创建测试动画数据
    问题：为什么电子不会掉入原子核？
    """

    # 场景1：经典物理学的困惑
    scene1 = Scene(
        scene_id="scene1",
        title="经典物理学的困惑",
        layout=LayoutConfig(
            type="dual",
            distribution="50-50",
            direction="horizontal",
            reasoning="对比经典期望与实际观察",
        ),
        content_areas=[
            ContentArea(
                area_id="classical_expectation",
                grid_position="1 / 1 / 2 / 2",
                content_type="svg",
                title="经典物理预期",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 原子核 -->
  <circle cx="200" cy="200" r="20" fill="#ff6b6b" stroke="#000" stroke-width="2"/>
  <text x="200" y="150" text-anchor="middle" font-size="14" fill="#333">原子核 (+)</text>
  
  <!-- 螺旋轨道表示电子应该掉落 -->
  <path d="M 320 200 Q 300 180 280 200 Q 260 220 240 200 Q 220 180 200 200" 
        fill="none" stroke="#4ecdc4" stroke-width="3" opacity="0.7"/>
  
  <!-- 电子 -->
  <circle cx="320" cy="200" r="8" fill="#4ecdc4">
    <animateMotion dur="3s" repeatCount="indefinite">
      <mpath href="#spiral"/>
    </animateMotion>
  </circle>
  
  <!-- 螺旋路径定义 -->
  <defs>
    <path id="spiral" d="M 320 200 Q 300 180 280 200 Q 260 220 240 200 Q 220 180 200 200"/>
  </defs>
  
  <!-- 辐射能量损失箭头 -->
  <path d="M 280 150 L 260 130" stroke="#ff9f43" stroke-width="2" marker-end="url(#arrowhead)"/>
  <path d="M 240 160 L 220 140" stroke="#ff9f43" stroke-width="2" marker-end="url(#arrowhead)"/>
  <text x="240" y="120" text-anchor="middle" font-size="12" fill="#ff9f43">能量辐射</text>
  
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#ff9f43"/>
    </marker>
  </defs>
  
  <text x="200" y="350" text-anchor="middle" font-size="16" fill="#e74c3c" font-weight="bold">
    电子应该螺旋坠落！
  </text>
</svg>""",
                caption="经典理论预测电子会损失能量并坠入原子核",
            ),
            ContentArea(
                area_id="actual_observation",
                grid_position="1 / 2 / 2 / 3",
                content_type="svg",
                title="实际观察",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 原子核 -->
  <circle cx="200" cy="200" r="20" fill="#ff6b6b" stroke="#000" stroke-width="2"/>
  <text x="200" y="150" text-anchor="middle" font-size="14" fill="#333">原子核 (+)</text>
  
  <!-- 稳定轨道 -->
  <circle cx="200" cy="200" r="80" fill="none" stroke="#4ecdc4" stroke-width="3" opacity="0.5"/>
  <circle cx="200" cy="200" r="120" fill="none" stroke="#4ecdc4" stroke-width="2" opacity="0.3"/>
  
  <!-- 电子在稳定轨道上 -->
  <circle cx="280" cy="200" r="8" fill="#4ecdc4">
    <animateTransform attributeName="transform" type="rotate" 
                     values="0 200 200;360 200 200" dur="2s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 稳定性标识 -->
  <text x="350" y="200" font-size="24" fill="#27ae60">✓</text>
  <text x="340" y="230" font-size="12" fill="#27ae60">稳定</text>
  
  <text x="200" y="350" text-anchor="middle" font-size="16" fill="#27ae60" font-weight="bold">
    电子保持稳定轨道！
  </text>
</svg>""",
                caption="实际上电子在稳定轨道上运行，不会坠落",
            ),
        ],
        explanation="经典物理学预测电子会因辐射能量而螺旋坠入原子核，但实际观察显示电子保持稳定轨道。这个矛盾需要量子力学来解释。",
        script="在经典物理学中，加速运动的电荷应该辐射电磁波并损失能量。按照这个理论，原子中的电子应该不断损失能量，最终螺旋坠入原子核。但实际上，我们观察到电子能够在稳定的轨道上无限期地运行，这就是著名的'原子稳定性悖论'。",
    )

    # 场景2：量子力学的解释
    scene2 = Scene(
        scene_id="scene2",
        title="量子力学中的电子概率云",
        layout=LayoutConfig(
            type="single",
            distribution="100",
            direction="horizontal",
            reasoning="需要大空间展示复杂的概率密度分布",
        ),
        content_areas=[
            ContentArea(
                area_id="probability_cloud",
                grid_position="1 / 1 / 2 / 2",
                content_type="svg",
                title="电子概率密度 |Ψ|²",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 概率密度梯度定义 -->
  <defs>
    <radialGradient id="probabilityGradient" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="20%" style="stop-color:#ffa726;stop-opacity:0.8" />
      <stop offset="40%" style="stop-color:#ffeb3b;stop-opacity:0.6" />
      <stop offset="60%" style="stop-color:#4caf50;stop-opacity:0.4" />
      <stop offset="80%" style="stop-color:#2196f3;stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:#9c27b0;stop-opacity:0.1" />
    </radialGradient>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 原子核 -->
  <circle cx="200" cy="200" r="15" fill="#333" stroke="#000" stroke-width="2"/>
  <text x="200" y="180" text-anchor="middle" font-size="12" fill="#333">核</text>
  
  <!-- 概率云 -->
  <circle cx="200" cy="200" r="150" fill="url(#probabilityGradient)" filter="url(#glow)">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 概率密度等高线 -->
  <circle cx="200" cy="200" r="30" fill="none" stroke="#ff6b6b" stroke-width="2" opacity="0.8"/>
  <circle cx="200" cy="200" r="60" fill="none" stroke="#ffa726" stroke-width="1.5" opacity="0.6"/>
  <circle cx="200" cy="200" r="90" fill="none" stroke="#4caf50" stroke-width="1" opacity="0.4"/>
  <circle cx="200" cy="200" r="120" fill="none" stroke="#2196f3" stroke-width="1" opacity="0.3"/>
  
  <!-- 概率密度标注 -->
  <text x="230" y="190" font-size="10" fill="#ff6b6b">高概率</text>
  <text x="260" y="200" font-size="10" fill="#ffa726">中概率</text>
  <text x="290" y="210" font-size="10" fill="#4caf50">低概率</text>
  
  <!-- 中心最高概率标识 -->
  <text x="200" y="240" text-anchor="middle" font-size="12" fill="#ff6b6b" font-weight="bold">
    |Ψ|² 最大值
  </text>
  
  <text x="200" y="360" text-anchor="middle" font-size="14" fill="#333" font-weight="bold">
    电子概率密度在原子核中心最高
  </text>
</svg>""",
                caption="量子力学中，电子的概率密度|Ψ|²在原子核中心达到最大值",
            )
        ],
        explanation="在量子力学中，电子不再是绕核运动的粒子，而是以概率云的形式存在。电子的概率密度|Ψ|²在原子核中心达到最大值，这意味着电子'已经坍缩'到原子核上。",
        script="量子力学彻底改变了我们对电子的理解。电子不再被视为绕原子核运动的小球，而是以概率云的形式存在。在氢原子的基态1s轨道中，电子出现的概率密度在原子核的正中心最高。从某种意义上说，电子已经'坍缩'到了原子核上，因此它无法进一步坍缩。",
    )

    # 场景3：概率密度vs径向概率
    scene3 = Scene(
        scene_id="scene3",
        title="概率密度 vs 径向概率分布",
        layout=LayoutConfig(
            type="dual",
            distribution="50-50",
            direction="horizontal",
            reasoning="对比两种不同的概率概念",
        ),
        content_areas=[
            ContentArea(
                area_id="probability_density",
                grid_position="1 / 1 / 2 / 2",
                content_type="svg",
                title="概率密度 |Ψ|²",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 坐标轴 -->
  <line x1="50" y1="350" x2="350" y2="350" stroke="#333" stroke-width="2"/>
  <line x1="50" y1="350" x2="50" y2="50" stroke="#333" stroke-width="2"/>
  
  <!-- 坐标轴标签 -->
  <text x="200" y="380" text-anchor="middle" font-size="12" fill="#333">距离原子核 (r)</text>
  <text x="25" y="200" text-anchor="middle" font-size="12" fill="#333" transform="rotate(-90 25 200)">|Ψ|²</text>
  
  <!-- 概率密度曲线 (指数衰减) -->
  <path d="M 50 100 Q 80 120 120 180 Q 160 240 200 280 Q 240 310 280 330 Q 320 340 350 345" 
        fill="none" stroke="#e74c3c" stroke-width="3"/>
  
  <!-- 最高点标识 -->
  <circle cx="50" cy="100" r="4" fill="#e74c3c"/>
  <text x="70" y="95" font-size="10" fill="#e74c3c">r=0时最大</text>
  
  <!-- 刻度 -->
  <line x1="50" y1="345" x2="50" y2="355" stroke="#333"/>
  <text x="50" y="370" text-anchor="middle" font-size="10" fill="#333">0</text>
  
  <line x1="150" y1="345" x2="150" y2="355" stroke="#333"/>
  <text x="150" y="370" text-anchor="middle" font-size="10" fill="#333">a₀</text>
  
  <line x1="250" y1="345" x2="250" y2="355" stroke="#333"/>
  <text x="250" y="370" text-anchor="middle" font-size="10" fill="#333">2a₀</text>
  
  <text x="200" y="30" text-anchor="middle" font-size="14" fill="#e74c3c" font-weight="bold">
    中心概率最高
  </text>
</svg>""",
                caption="概率密度在原子核中心(r=0)处最大",
            ),
            ContentArea(
                area_id="radial_probability",
                grid_position="1 / 2 / 2 / 3",
                content_type="svg",
                title="径向概率 |Ψ|²r²",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 坐标轴 -->
  <line x1="50" y1="350" x2="350" y2="350" stroke="#333" stroke-width="2"/>
  <line x1="50" y1="350" x2="50" y2="50" stroke="#333" stroke-width="2"/>
  
  <!-- 坐标轴标签 -->
  <text x="200" y="380" text-anchor="middle" font-size="12" fill="#333">距离原子核 (r)</text>
  <text x="25" y="200" text-anchor="middle" font-size="12" fill="#333" transform="rotate(-90 25 200)">|Ψ|²r²</text>
  
  <!-- 径向概率曲线 (先增后减) -->
  <path d="M 50 350 Q 80 300 120 200 Q 160 120 200 150 Q 240 200 280 280 Q 320 330 350 345" 
        fill="none" stroke="#27ae60" stroke-width="3"/>
  
  <!-- 波尔半径最高点 -->
  <circle cx="150" cy="120" r="4" fill="#27ae60"/>
  <text x="120" y="110" font-size="10" fill="#27ae60">波尔半径a₀</text>
  <line x1="150" y1="120" x2="150" y2="350" stroke="#27ae60" stroke-width="1" stroke-dasharray="5,5"/>
  
  <!-- 原点为0 -->
  <circle cx="50" cy="350" r="3" fill="#27ae60"/>
  <text x="60" y="340" font-size="10" fill="#27ae60">r=0时为0</text>
  
  <!-- 刻度 -->
  <line x1="50" y1="345" x2="50" y2="355" stroke="#333"/>
  <text x="50" y="370" text-anchor="middle" font-size="10" fill="#333">0</text>
  
  <line x1="150" y1="345" x2="150" y2="355" stroke="#333"/>
  <text x="150" y="370" text-anchor="middle" font-size="10" fill="#333">a₀</text>
  
  <line x1="250" y1="345" x2="250" y2="355" stroke="#333"/>
  <text x="250" y="370" text-anchor="middle" font-size="10" fill="#333">2a₀</text>
  
  <text x="200" y="30" text-anchor="middle" font-size="14" fill="#27ae60" font-weight="bold">
    波尔半径处概率最高
  </text>
</svg>""",
                caption="径向概率在波尔半径处达到最大值",
            ),
        ],
        explanation="概率密度|Ψ|²告诉我们在特定点找到电子的概率，而径向概率|Ψ|²r²告诉我们在特定距离的球面上找到电子的概率。虽然概率密度在中心最高，但由于球面面积随距离增加，径向概率在波尔半径处达到最大。",
        script="这里需要区分两个重要概念。概率密度|Ψ|²描述的是在空间中某个特定点找到电子的可能性，它在原子核中心最大。但是径向概率分布|Ψ|²r²考虑了球面面积的影响：虽然在原子核附近每个点的概率密度很高，但这样的点很少；而在距离原子核一个波尔半径的地方，虽然每个点的概率密度较低，但这样的点更多。因此，在波尔半径处找到电子的总概率最大。",
    )

    # 场景4：体积效应解释
    scene4 = Scene(
        scene_id="scene4",
        title="体积效应的可视化解释",
        layout=LayoutConfig(
            type="mixed",
            distribution="70-30",
            direction="mixed",
            reasoning="需要主图展示体积概念，辅助区域显示数学关系",
        ),
        content_areas=[
            ContentArea(
                area_id="volume_visualization",
                grid_position="1 / 1 / 2 / 2",
                content_type="svg",
                title="不同距离处的体积对比",
                content="""<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 原子核 -->
  <circle cx="200" cy="200" r="10" fill="#ff6b6b" stroke="#000" stroke-width="2"/>
  <text x="200" y="180" text-anchor="middle" font-size="10" fill="#333">核</text>
  
  <!-- 不同半径的球壳 -->
  <!-- r1 = 小半径 -->
  <circle cx="200" cy="200" r="40" fill="none" stroke="#e74c3c" stroke-width="3" opacity="0.8"/>
  <text x="160" y="190" font-size="10" fill="#e74c3c">r₁</text>
  <text x="120" y="200" font-size="10" fill="#e74c3c">体积小</text>
  
  <!-- r2 = 中等半径 -->
  <circle cx="200" cy="200" r="80" fill="none" stroke="#f39c12" stroke-width="3" opacity="0.6"/>
  <text x="120" y="180" font-size="10" fill="#f39c12">r₂</text>
  <text x="80" y="190" font-size="10" fill="#f39c12">体积中等</text>
  
  <!-- r3 = 大半径 -->
  <circle cx="200" cy="200" r="120" fill="none" stroke="#27ae60" stroke-width="3" opacity="0.4"/>
  <text x="80" y="170" font-size="10" fill="#27ae60">r₃</text>
  <text x="40" y="180" font-size="10" fill="#27ae60">体积大</text>
  
  <!-- 球壳面积标识 -->
  <path d="M 240 200 A 40 40 0 0 1 240 240 A 40 40 0 0 1 200 240" 
        fill="rgba(231,76,60,0.3)" stroke="#e74c3c" stroke-width="2"/>
  <text x="250" y="225" font-size="9" fill="#e74c3c">4πr₁²</text>
  
  <path d="M 280 200 A 80 80 0 0 1 280 280 A 80 80 0 0 1 200 280" 
        fill="rgba(243,156,18,0.2)" stroke="#f39c12" stroke-width="2"/>
  <text x="290" y="245" font-size="9" fill="#f39c12">4πr₂²</text>
  
  <!-- 箭头指示体积增长 -->
  <path d="M 60 320 L 340 320" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="200" y="340" text-anchor="middle" font-size="12" fill="#333">距离增加，可用体积增加</text>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#333"/>
    </marker>
  </defs>
</svg>""",
                caption="距离原子核越远，可用的空间体积越大",
            ),
            ContentArea(
                area_id="math_explanation",
                grid_position="1 / 2 / 2 / 3",
                content_type="html",
                title="数学关系",
                content="""<div style="padding: 10px; font-size: 12px; color: white;">
  <p><strong>概率密度：</strong></p>
  <p>|Ψ|² ∝ e<sup>-2r/a₀</sup></p>
  <p style="color: #ff6b6b;">↑ 随距离指数衰减</p>
  
  <hr style="margin: 15px 0; border-color: #555;">
  
  <p><strong>球面面积：</strong></p>
  <p>A = 4πr²</p>
  <p style="color: #27ae60;">↑ 随距离平方增长</p>
  
  <hr style="margin: 15px 0; border-color: #555;">
  
  <p><strong>径向概率：</strong></p>
  <p>P(r) = |Ψ|² × 4πr²</p>
  <p style="color: #f39c12;">= 衰减 × 增长</p>
  <p>最大值在 r = a₀</p>
</div>""",
                caption="概率密度衰减与体积增长的平衡",
            ),
            ContentArea(
                area_id="conclusion",
                grid_position="2 / 1 / 3 / 3",
                content_type="html",
                title="结论",
                content="""<div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: center;">
  <h3 style="color: #ffeb3b; margin-bottom: 10px;">为什么电子不会坠落？</h3>
  <p style="font-size: 14px; line-height: 1.6;">
    电子的概率云已经<strong style="color: #4CAF50;">"坍缩"</strong>到原子核上（概率密度在中心最高），
    因此它无法进一步坍缩。虽然我们在波尔半径处最可能找到电子，
    但这只是因为那里的<strong style="color: #2196F3;">可用空间更大</strong>。
  </p>
</div>""",
                caption="量子力学完美解释了原子的稳定性",
            ),
        ],
        explanation="电子不会坠落的根本原因是：在量子力学中，电子已经'坍缩'到原子核上（概率密度在中心最高）。我们在波尔半径处最可能找到电子，仅仅是因为那里的可用空间（球面面积）更大，而不是因为电子'想要'待在那里。",
        script="现在我们可以回答最初的问题了。电子不会坠入原子核的原因是：从量子力学的角度看，电子实际上已经'坍缩'到原子核上了。电子的概率密度在原子核中心达到最大值，这意味着电子已经以最大可能性存在于原子核位置。我们之所以在实验中最可能在波尔半径处发现电子，并不是因为电子'喜欢'那个位置，而是因为在那个距离上，概率密度的衰减和可用空间体积的增长达到了最佳平衡。这就是量子力学对原子稳定性的完美解释。",
    )

    return AnimationData(
        animation_title="量子力学解释：为什么电子不会掉入原子核？",
        total_scenes=4,
        scenes=[scene1, scene2, scene3, scene4],
    )


def save_test_data_as_json():
    """将测试数据保存为JSON文件"""
    import json

    test_data = create_test_animation_data()

    with open("test_animation_data.json", "w", encoding="utf-8") as f:
        json.dump(test_data.model_dump(), f, ensure_ascii=False, indent=2)

    print("✅ 测试数据已保存到 test_animation_data.json")
    return test_data


if __name__ == "__main__":
    # 创建并保存测试数据
    test_data = save_test_data_as_json()
    print(f"📊 生成了 {test_data.total_scenes} 个场景的测试数据")
    print(f"🎬 动画标题: {test_data.animation_title}")
