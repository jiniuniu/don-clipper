// ===== 虚拟返回数据，用于前端调试 =====

const DUMMY_ANIMATION_DATA = {
  success: true,
  data: {
    question: "为什么电子不会掉入原子核？",
    title: "量子力学解释：电子的稳定性原理",
    total_scenes: 3,
    style: {
      primary_color: "#2196F3",
      background: "dark",
      font_size: "medium",
    },
    scenes: [
      {
        scene_id: "scene1",
        title: "经典物理学的困惑",
        svg_content: `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景渐变 -->
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
    </linearGradient>
    <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b"/>
    </marker>
  </defs>
  
  <rect width="800" height="600" fill="url(#bgGrad)"/>
  
  <!-- 原子核 -->
  <circle cx="400" cy="300" r="30" fill="#ef4444" stroke="#dc2626" stroke-width="4"/>
  <text x="400" y="240" text-anchor="middle" font-size="20" font-weight="bold" fill="#1f2937">原子核 (+)</text>
  
  <!-- 螺旋轨道路径 -->
  <path d="M 650 300 Q 620 250 580 300 Q 540 350 500 300 Q 460 250 430 300" 
        fill="none" stroke="#3b82f6" stroke-width="5" opacity="0.6" stroke-dasharray="10,5"/>
  
  <!-- 电子 -->
  <circle cx="650" cy="300" r="15" fill="#3b82f6" stroke="#1e40af" stroke-width="2">
    <animateMotion dur="4s" repeatCount="indefinite">
      <mpath href="#spiral"/>
    </animateMotion>
  </circle>
  
  <!-- 螺旋路径定义 -->
  <defs>
    <path id="spiral" d="M 650 300 Q 620 250 580 300 Q 540 350 500 300 Q 460 250 430 300"/>
  </defs>
  
  <!-- 能量辐射箭头 -->
  <g opacity="0.8">
    <line x1="580" y1="250" x2="550" y2="220" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrow)">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
    </line>
    <line x1="540" y1="350" x2="510" y2="380" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrow)">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
    </line>
    <text x="520" y="200" text-anchor="middle" font-size="18" font-weight="bold" fill="#f59e0b">⚡ 能量辐射</text>
  </g>
  
  <!-- 疑问标识 -->
  <text x="400" y="520" text-anchor="middle" font-size="24" font-weight="bold" fill="#dc2626">
    ❓ 经典预测：电子应该螺旋坠落！
  </text>
  
  <!-- 实际观察对比 -->
  <text x="120" y="300" text-anchor="middle" font-size="16" font-weight="bold" fill="#059669">
    ✅ 实际观察：<tspan x="120" dy="25">电子保持稳定</tspan>
  </text>
  <circle cx="120" cy="230" r="60" fill="none" stroke="#059669" stroke-width="3" opacity="0.7">
    <animate attributeName="stroke-dasharray" values="0,377;188.5,188.5;0,377" dur="3s" repeatCount="indefinite"/>
  </circle>
</svg>`,
        explanation:
          "经典物理学预测电子会因辐射能量而螺旋坠入原子核，但实际观察显示电子保持稳定轨道。",
      },
      {
        scene_id: "scene2",
        title: "量子力学的概率云",
        svg_content: `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="800" height="600" fill="#0f172a"/>
  
  <!-- 概率云渐变 -->
  <defs>
    <radialGradient id="probCloud" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.9"/>
      <stop offset="20%" style="stop-color:#f97316;stop-opacity:0.7"/>
      <stop offset="40%" style="stop-color:#eab308;stop-opacity:0.5"/>
      <stop offset="60%" style="stop-color:#22c55e;stop-opacity:0.3"/>
      <stop offset="80%" style="stop-color:#3b82f6;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.1"/>
    </radialGradient>
    
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 原子核 -->
  <circle cx="400" cy="300" r="20" fill="#f8fafc" stroke="#1f2937" stroke-width="3"/>
  <text x="400" y="260" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">核心</text>
  
  <!-- 动态概率云 -->
  <circle cx="400" cy="300" r="200" fill="url(#probCloud)" filter="url(#glow)">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 概率密度等高线 -->
  <circle cx="400" cy="300" r="60" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.8">
    <animate attributeName="r" values="60;65;60" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="400" cy="300" r="100" fill="none" stroke="#f97316" stroke-width="2" opacity="0.6">
    <animate attributeName="r" values="100;105;100" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="400" cy="300" r="140" fill="none" stroke="#eab308" stroke-width="2" opacity="0.4">
    <animate attributeName="r" values="140;145;140" dur="3s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 概率密度标注 -->
  <g fill="#f8fafc" font-size="14" font-weight="bold">
    <text x="460" y="280">🔴 高概率区</text>
    <text x="500" y="300">🟠 中概率区</text>
    <text x="540" y="320">🟡 低概率区</text>
  </g>
  
  <!-- 波函数符号 -->
  <text x="400" y="380" text-anchor="middle" font-size="20" font-weight="bold" fill="#ef4444">
    |Ψ|² 最大值在此！
  </text>
  
  <!-- 底部说明 -->
  <text x="400" y="550" text-anchor="middle" font-size="22" font-weight="bold" fill="#22c55e">
    🌊 电子概率云：已经"坍缩"到核心
  </text>
</svg>`,
        explanation:
          "在量子力学中，电子以概率云形式存在，概率密度在原子核中心达到最大值，意味着电子已经'坍缩'到核心。",
      },
      {
        scene_id: "scene3",
        title: "为什么不会进一步坍缩",
        svg_content: `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <defs>
    <linearGradient id="finalBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#finalBg)"/>
  
  <!-- 原子核（稳定状态） -->
  <circle cx="400" cy="300" r="25" fill="#22c55e" stroke="#16a34a" stroke-width="4">
    <animate attributeName="fill" values="#22c55e;#16a34a;#22c55e" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="400" y="250" text-anchor="middle" font-size="18" font-weight="bold" fill="#f8fafc">稳定核心</text>
  
  <!-- 概率云（稳定状态） -->
  <circle cx="400" cy="300" r="120" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" stroke-width="2" opacity="0.8">
    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 能量平衡指示器 -->
  <g transform="translate(150, 180)">
    <rect x="0" y="0" width="120" height="80" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="2" rx="8"/>
    <text x="60" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#3b82f6">量子能级</text>
    <line x1="20" y1="45" x2="100" y2="45" stroke="#3b82f6" stroke-width="3"/>
    <text x="60" y="65" text-anchor="middle" font-size="12" fill="#f8fafc">E = 最低能量</text>
  </g>
  
  <!-- 阻挡进一步坍缩的量子效应 -->
  <g transform="translate(530, 180)">
    <rect x="0" y="0" width="120" height="80" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="2" rx="8"/>
    <text x="60" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#ef4444">量子阻挡</text>
    <text x="60" y="45" text-anchor="middle" font-size="20" fill="#ef4444">🚫</text>
    <text x="60" y="65" text-anchor="middle" font-size="12" fill="#f8fafc">无法更近</text>
  </g>
  
  <!-- 平衡箭头 -->
  <g transform="translate(400, 120)">
    <line x1="-80" y1="0" x2="-20" y2="0" stroke="#22c55e" stroke-width="4" marker-end="url(#greenArrow)"/>
    <line x1="80" y1="0" x2="20" y2="0" stroke="#ef4444" stroke-width="4" marker-end="url(#redArrow)"/>
    <circle cx="0" cy="0" r="15" fill="#eab308" stroke="#d97706" stroke-width="3"/>
    <text x="0" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="#eab308">⚖️ 平衡</text>
  </g>
  
  <!-- 箭头定义 -->
  <defs>
    <marker id="greenArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e"/>
    </marker>
    <marker id="redArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444"/>
    </marker>
  </defs>
  
  <!-- 结论 -->
  <text x="400" y="450" text-anchor="middle" font-size="20" font-weight="bold" fill="#22c55e">
    ✨ 量子力学完美解答
  </text>
  <text x="400" y="480" text-anchor="middle" font-size="16" fill="#f8fafc">
    电子已经处于最稳定的量子态
  </text>
  <text x="400" y="510" text-anchor="middle" font-size="16" fill="#f8fafc">
    无法进一步"坍缩"
  </text>
  
  <!-- 装饰性粒子效果 -->
  <g opacity="0.6">
    <circle cx="200" cy="100" r="3" fill="#3b82f6">
      <animate attributeName="cy" values="100;500;100" dur="8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="600" cy="500" r="2" fill="#8b5cf6">
      <animate attributeName="cy" values="500;100;500" dur="6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="6s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`,
        explanation:
          "电子已经处于最低能量的稳定量子态，量子力学的基本原理阻止其进一步坍缩到原子核中。",
      },
    ],
  },
};

// ===== 用于替换真实API调用的虚拟函数 =====

// 模拟API延迟
function simulateDelay(ms = 2000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 虚拟的生成动画函数（替换真实的API调用）
async function generateAnimationDummy() {
  if (isGenerating) return;

  const question = document.getElementById("question-input").value.trim();
  if (!question) {
    showStatus("error", "请输入问题");
    return;
  }

  isGenerating = true;
  showStatus("loading", "AI正在分析问题并生成动画...");
  disableGeneration(true);

  try {
    // 模拟API调用延迟
    await simulateDelay(3000);

    // 使用虚拟数据
    const result = DUMMY_ANIMATION_DATA;

    if (result.success && result.data) {
      animationData = result.data;
      currentScene = 0;

      showStatus(
        "success",
        `✅ 生成成功！共 ${animationData.total_scenes} 个场景`
      );
      showAnimation();
      showScene(0);
    } else {
      showStatus("error", result.error || "生成失败");
    }
  } catch (error) {
    console.error("生成失败:", error);
    showStatus("error", `请求失败: ${error.message}`);
  } finally {
    isGenerating = false;
    disableGeneration(false);
  }
}

// ===== 调试模式切换 =====

let DEBUG_MODE = false;

// 切换调试模式的函数
function toggleDebugMode() {
  DEBUG_MODE = !DEBUG_MODE;
  console.log(`🐛 调试模式 ${DEBUG_MODE ? "开启" : "关闭"}`);

  if (DEBUG_MODE) {
    // 替换生成函数为虚拟版本
    window.originalGenerateAnimation = window.generateAnimation;
    window.generateAnimation = generateAnimationDummy;
    console.log("✅ 已切换到虚拟数据模式");
  } else {
    // 恢复真实API调用
    if (window.originalGenerateAnimation) {
      window.generateAnimation = window.originalGenerateAnimation;
      console.log("✅ 已切换到真实API模式");
    }
  }
}

// 快速加载虚拟数据的函数
function loadDummyData() {
  console.log("🎭 加载虚拟数据...");
  animationData = DUMMY_ANIMATION_DATA.data;
  currentScene = 0;
  showAnimation();
  showScene(0);
  showStatus("success", "🎭 虚拟数据加载成功！");
}

// 在控制台中暴露调试函数
window.toggleDebugMode = toggleDebugMode;
window.loadDummyData = loadDummyData;
window.DUMMY_ANIMATION_DATA = DUMMY_ANIMATION_DATA;

console.log("🎭 虚拟数据已准备就绪！");
console.log("📝 可用的调试命令：");
console.log("  - toggleDebugMode()  // 切换调试模式");
console.log("  - loadDummyData()    // 快速加载虚拟数据");
console.log("  - debugInfo()        // 查看当前状态");
