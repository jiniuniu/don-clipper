// ===== 全局状态 =====
let currentScene = 0;
let animationData = null;
let isGenerating = false;

// ===== 初始化 =====
document.addEventListener("DOMContentLoaded", function () {
  // 加载示例数据
  loadSampleData();

  // 绑定样式变化事件
  bindStyleEvents();

  // 绑定键盘快捷键
  bindKeyboardEvents();
});

// ===== 示例数据 =====
function loadSampleData() {
  const sampleQuestion = `为什么电子不会掉入原子核？

在经典物理学中，加速运动的电荷会辐射电磁波并损失能量。按照这个理论，原子中的电子应该不断损失能量，最终螺旋坠入原子核。

但实际上，我们观察到电子能够在稳定的轨道上无限期地运行。这个现象该如何用量子力学来解释？`;

  document.getElementById("question-input").value = sampleQuestion;
}

// ===== 样式切换事件 =====
function bindStyleEvents() {
  const app = document.getElementById("app");

  // 主色调切换
  document
    .getElementById("primary-color")
    .addEventListener("change", function (e) {
      document.documentElement.style.setProperty(
        "--primary-color",
        e.target.value
      );
      // 计算hover颜色
      const hoverColor = adjustBrightness(e.target.value, -20);
      document.documentElement.style.setProperty("--primary-hover", hoverColor);

      const lightColor = hexToRgba(e.target.value, 0.1);
      document.documentElement.style.setProperty("--primary-light", lightColor);
    });

  // 主题切换
  document
    .getElementById("background-theme")
    .addEventListener("change", function (e) {
      app.setAttribute("data-theme", e.target.value);
    });

  // 字体大小切换
  document.getElementById("font-size").addEventListener("change", function (e) {
    app.setAttribute("data-font", e.target.value);
  });
}

// ===== 键盘快捷键 =====
function bindKeyboardEvents() {
  document.addEventListener("keydown", function (e) {
    if (isGenerating) return;

    // Ctrl + Enter 生成动画
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      generateAnimation();
      return;
    }

    // 如果没有动画数据，不处理导航键
    if (!animationData) return;

    // 左箭头 - 上一个场景
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevScene();
    }

    // 右箭头或空格 - 下一个场景
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      nextScene();
    }

    // 数字键 1-9 - 跳转到指定场景
    if (e.key >= "1" && e.key <= "9") {
      const sceneIndex = parseInt(e.key) - 1;
      if (sceneIndex < animationData.scenes.length) {
        showScene(sceneIndex);
      }
    }
  });
}

// ===== 主要功能：生成动画 =====
async function generateAnimation() {
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
    const styleConfig = {
      primary_color: document.getElementById("primary-color").value,
      background: document.getElementById("background-theme").value,
      font_size: document.getElementById("font-size").value,
    };

    const response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        style: styleConfig,
      }),
    });

    const result = await response.json();

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

// ===== 场景导航 =====
function showScene(index) {
  if (!animationData || index < 0 || index >= animationData.scenes.length) {
    return;
  }

  currentScene = index;
  const scene = animationData.scenes[index];
  const sceneContainer = document.getElementById("scene-container");

  // 先移除之前的动画类（如果存在）
  sceneContainer.classList.remove("scene-transition");

  // 使用 requestAnimationFrame 确保DOM更新完成后再添加动画
  requestAnimationFrame(() => {
    // 渲染场景内容
    sceneContainer.innerHTML = `
            <div class="scene-header">
                <h2 class="scene-title">${scene.title}</h2>
                <span class="scene-counter">${index + 1}/${animationData.total_scenes}</span>
            </div>
            <div class="scene-body">
                <div class="svg-section">
                    <div class="svg-container">
                        ${scene.svg_content}
                    </div>
                </div>
                <div class="explanation-section">
                    <div class="explanation-content">
                        💡 ${scene.explanation}
                    </div>
                </div>
            </div>
        `;

    // 在下一帧添加过渡动画
    requestAnimationFrame(() => {
      sceneContainer.classList.add("scene-transition");

      // 动画完成后移除类
      setTimeout(() => {
        sceneContainer.classList.remove("scene-transition");
      }, 300);
    });

    // 更新导航状态
    updateNavigation();
  });
}

function nextScene() {
  if (animationData && currentScene < animationData.scenes.length - 1) {
    showScene(currentScene + 1);
  }
}

function prevScene() {
  if (animationData && currentScene > 0) {
    showScene(currentScene - 1);
  }
}

function jumpToScene(index) {
  showScene(index);
}

// ===== UI 更新函数 =====
function showAnimation() {
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("scene-container").style.display = "flex";
  document.getElementById("scene-navigation").style.display = "flex";
}

function hideAnimation() {
  document.getElementById("placeholder").style.display = "flex";
  document.getElementById("scene-container").style.display = "none";
  document.getElementById("scene-navigation").style.display = "none";
}

function updateNavigation() {
  if (!animationData) return;

  // 更新按钮状态
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.disabled = currentScene === 0;
  nextBtn.disabled = currentScene === animationData.scenes.length - 1;

  // 更新指示点
  const dotsContainer = document.getElementById("scene-dots");
  dotsContainer.innerHTML = "";

  for (let i = 0; i < animationData.scenes.length; i++) {
    const dot = document.createElement("span");
    dot.className = `dot ${i === currentScene ? "active" : ""}`;
    dot.onclick = () => jumpToScene(i);
    dot.title = animationData.scenes[i].title;
    dotsContainer.appendChild(dot);
  }
}

function showStatus(type, message) {
  const statusArea = document.getElementById("status");
  statusArea.className = `status-${type}`;

  if (type === "loading") {
    statusArea.innerHTML = `
            <div class="spinner"></div>
            <div>
                <div style="font-weight: 600; margin-bottom: 4px;">${message}</div>
                <div style="font-size: 0.875rem; opacity: 0.8;">这可能需要30-60秒，请耐心等待</div>
            </div>
        `;
  } else {
    statusArea.innerHTML = `<div>${message}</div>`;
  }

  // 自动清除成功和错误状态
  if (type === "success" || type === "error") {
    setTimeout(() => {
      statusArea.className = "";
      statusArea.innerHTML = "";
    }, 5000);
  }
}

function disableGeneration(disabled) {
  const btn = document.getElementById("generate-btn");
  btn.disabled = disabled;
  btn.textContent = disabled ? "⏳ 生成中..." : "🚀 生成动画";
}

// ===== 工具函数 =====
function adjustBrightness(hex, percent) {
  // 将hex转换为rgb，然后调整亮度
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ===== 调试功能 =====
function debugInfo() {
  console.log("当前状态:", {
    currentScene,
    animationData: animationData
      ? {
          title: animationData.title,
          total_scenes: animationData.total_scenes,
          scenes: animationData.scenes.map((s) => s.title),
        }
      : null,
    isGenerating,
  });
}

// 暴露调试函数到全局
window.debugInfo = debugInfo;
