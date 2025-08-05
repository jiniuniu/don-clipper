// 动画页面JavaScript功能
let currentScene = 1;
let autoPlay = false;
let scriptsVisible = false;

function showScene(sceneId) {
  // 隐藏所有场景
  document.querySelectorAll(".scene").forEach((scene) => {
    scene.classList.remove("current-scene");
    scene.style.display = "none";
  });

  // 显示选中场景
  const targetScene = document.getElementById(sceneId);
  if (targetScene) {
    targetScene.style.display = "flex";
    targetScene.classList.add("current-scene");
    targetScene.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function toggleScripts() {
  scriptsVisible = !scriptsVisible;
  document.querySelectorAll(".script-panel").forEach((panel) => {
    panel.classList.toggle("active", scriptsVisible);
  });
}

function playAll() {
  autoPlay = true;
  const scenes = window.sceneIds || [];
  let currentIndex = 0;

  function playNext() {
    if (currentIndex < scenes.length && autoPlay) {
      showScene(scenes[currentIndex]);
      currentIndex++;
      setTimeout(playNext, 5000); // 每场景5秒
    } else {
      autoPlay = false;
    }
  }

  playNext();
}

function stopAutoPlay() {
  autoPlay = false;
}

// 初始化显示第一个场景
document.addEventListener("DOMContentLoaded", function () {
  const firstScene = document.querySelector(".scene");
  if (firstScene) {
    showScene(firstScene.id);
  }
});

// 键盘控制
document.addEventListener("keydown", function (e) {
  if (autoPlay) return;

  const scenes = window.sceneIds || [];
  const currentIndex = scenes.findIndex(
    (id) => document.getElementById(id).style.display === "flex"
  );

  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    if (currentIndex < scenes.length - 1) {
      showScene(scenes[currentIndex + 1]);
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (currentIndex > 0) {
      showScene(scenes[currentIndex - 1]);
    }
  } else if (e.key === "Escape") {
    stopAutoPlay();
  }
});
