// 前端页面JavaScript功能
let isGenerating = false;

// 预设示例数据
const SAMPLE_DATA = {
  question: `为什么电子不会掉入原子核？

在经典物理学中，运动的物体最终会因为摩擦或辐射失去能量而减速。但原子中的电子似乎无限期地"轨道运行"，不会螺旋进入原子核或辐射掉它们的能量。

我知道量子力学取代了经典图像，但仍然为什么电子不会随着时间"失去能量"？是什么阻止它们坍缩到原子核中？除了"它只是一个稳定的量子态"之外，是否有明确的物理解释？`,

  answer: `简而言之，这是因为电子实际上已经坍缩到原子核上，并且以原子核为中心。因此，它们没有办法更靠近并在此过程中失去能量。

如果你看氢原子最低轨道(1s)中电子的概率密度(即通常标记为|Ψ|²的量)，你会发现概率在原子核的正中心明显最高。

然而，在实验上，当我们试图确定电子相对于原子核最可能的距离时，我们得到的是径向概率分布。

第一个量是"概率密度"，|Ψ|²，它是在特定空间点找到电子的概率的度量。第二个量是"径向概率"，|Ψ|²r²，它是在给定距离处找到电子的概率的度量。

当你远离原子中心时，"体积"增加。在原子的正中心只有一个点可以找到电子...但随着你向外移动，电子可以位于"更多点"上。

所以，当你从中心向外移动时，概率密度降低...但在给定距离处的球面表面积增加。因此，即使在球体内任何给定点找到电子的概率较低，但球体内可以找到电子的"点"更多...所以径向概率实际上增加，直到你达到波尔半径。`,
};

// 页面加载时填充示例数据
window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("question").value = SAMPLE_DATA.question;
  document.getElementById("answer").value = SAMPLE_DATA.answer;
});

async function generateAnimation() {
  if (isGenerating) return;

  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();

  if (!question || !answer) {
    showError("请输入问题和答案");
    return;
  }

  isGenerating = true;
  showLoading(true);
  hideError();
  hideSuccess();

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        answer: answer,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showResult(result.html_content);
      showSuccess(`✅ 成功生成 ${result.scene_count} 个教学场景！`);
    } else {
      showError(`生成失败: ${result.error}`);
    }
  } catch (error) {
    showError(`请求失败: ${error.message}`);
  } finally {
    isGenerating = false;
    showLoading(false);
  }
}

function showLoading(show) {
  const loading = document.getElementById("loading");
  const btn = document.querySelector(".generate-btn");

  loading.classList.toggle("active", show);
  btn.disabled = show;
  btn.textContent = show ? "⏳ 生成中..." : "🚀 生成动画";
}

function showResult(htmlContent) {
  const placeholder = document.getElementById("placeholder");
  const iframe = document.getElementById("result-iframe");

  placeholder.style.display = "none";
  iframe.style.display = "block";

  // 将HTML内容写入iframe
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  iframe.src = url;
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.classList.add("active");
}

function hideError() {
  document.getElementById("error-message").classList.remove("active");
}

function showSuccess(message) {
  const successDiv = document.getElementById("success-info");
  successDiv.textContent = message;
  successDiv.classList.add("active");
}

function hideSuccess() {
  document.getElementById("success-info").classList.remove("active");
}

// 键盘快捷键
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") {
    generateAnimation();
  }
});
