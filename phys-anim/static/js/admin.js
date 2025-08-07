// admin.js - Physics Animation Admin 核心交互逻辑 - 完整版

class PhysicsAdmin {
  constructor() {
    this.currentContent = null;
    this.currentTab = "animation";
    this.selectedHistoryId = null;
    this.searchTimeout = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.init();
  }

  // ============ 初始化 ============
  init() {
    this.bindEvents();
    this.loadHistoryList();
    this.showWelcomeState();
    this.setupKeyboardShortcuts();
    this.checkConnectivity();
    this.initializeWithSettings();
    this.setupContextMenu();

    // 添加版本信息
    console.log("Physics Animation Admin v1.0.0 initialized");
  }

  // ============ 事件绑定 ============
  bindEvents() {
    // 生成按钮
    document.getElementById("generate-btn").addEventListener("click", () => {
      this.handleGenerate();
    });

    // 输入框事件
    const questionInput = document.getElementById("question-input");
    questionInput.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.handleGenerate();
      }
    });

    // 输入框自动调整高度
    questionInput.addEventListener("input", (e) => {
      this.autoResizeTextarea(e.target);
      this.validateInput();
    });

    // 历史搜索防抖
    document.getElementById("history-search").addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 300);
    });

    // Tab切换
    document.getElementById("animation-tab").addEventListener("click", () => {
      this.switchTab("animation");
    });
    document.getElementById("code-tab").addEventListener("click", () => {
      this.switchTab("code");
    });

    // 复制代码按钮
    document.getElementById("copy-code-btn").addEventListener("click", () => {
      this.copyCode();
    });

    // 全局错误处理
    window.addEventListener("error", (e) => {
      console.error("Global error:", e.error);
      this.showToast("发生了意外错误", "error");
    });

    // 网络状态监听
    window.addEventListener("online", () => {
      this.showToast("网络连接已恢复", "success");
    });

    window.addEventListener("offline", () => {
      this.showToast("网络连接已断开", "warning");
    });
  }

  // ============ 生成相关功能 ============
  async handleGenerate() {
    const question = document.getElementById("question-input").value.trim();
    const model = document.getElementById("model-select").value;

    if (!this.validateGeneration(question)) {
      return;
    }

    try {
      // 显示加载状态
      this.showLoadingState();
      this.setButtonLoading(true);
      this.retryCount = 0;

      // 调用生成API (带重试机制)
      const result = await this.callGenerateAPI(question, model);

      // 显示结果
      this.displayContent(result);
      this.showToast("生成成功！", "success");

      // 清空输入框并重置
      document.getElementById("question-input").value = "";
      this.validateInput();

      // 刷新历史列表
      setTimeout(() => this.loadHistoryList(), 500);
    } catch (error) {
      console.error("Generation failed:", error);
      this.handleGenerationError(error);
    } finally {
      this.setButtonLoading(false);
    }
  }

  validateGeneration(question) {
    if (!question) {
      this.showToast("请输入物理问题", "warning");
      document.getElementById("question-input").focus();
      return false;
    }

    if (question.length < 5) {
      this.showToast("问题描述太短，请详细描述", "warning");
      return false;
    }

    if (question.length > 500) {
      this.showToast("问题描述过长，请控制在500字以内", "warning");
      return false;
    }

    return true;
  }

  async callGenerateAPI(question, model) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch("/api/v1/generate/full", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
            model: model,
          }),
          signal: AbortSignal.timeout(60000), // 60秒超时
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "生成失败");
        }

        return await response.json();
      } catch (error) {
        this.retryCount = attempt;

        if (attempt < this.maxRetries && this.shouldRetry(error)) {
          this.showToast(
            `网络错误，正在重试... (${attempt + 1}/${this.maxRetries})`,
            "info"
          );
          await this.delay(1000 * (attempt + 1)); // 递增延迟
          continue;
        }

        throw error;
      }
    }
  }

  shouldRetry(error) {
    const retryableErrors = ["NetworkError", "AbortError", "TypeError"];
    return (
      retryableErrors.some((type) => error.name === type) ||
      error.message.includes("fetch") ||
      error.message.includes("network")
    );
  }

  handleGenerationError(error) {
    let message = "生成失败";
    let type = "error";

    if (error.name === "AbortError") {
      message = "请求超时，请稍后重试";
    } else if (error.message.includes("rate limit")) {
      message = "API调用频率过高，请稍后重试";
      type = "warning";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      message = "网络连接异常，请检查网络";
      type = "warning";
    } else if (error.message) {
      message = `生成失败: ${error.message}`;
    }

    this.showErrorState(message);
    this.showToast(message, type);
  }

  setButtonLoading(loading) {
    const btn = document.getElementById("generate-btn");
    if (loading) {
      btn.disabled = true;
      btn.innerHTML =
        '<div class="loading-spinner w-4 h-4 mr-2"></div>生成中...';
    } else {
      btn.disabled = false;
      btn.innerHTML = "🚀 生成";
    }
  }

  // ============ 内容渲染功能 ============
  displayContent(data) {
    this.currentContent = data;
    this.selectedHistoryId = data.id;

    // 更新基本信息
    document.getElementById("content-question").textContent = data.question;

    const statusIcon = this.getStatusIcon(data.status);
    const statusText =
      data.status === "success"
        ? "成功"
        : data.status === "failed"
          ? "失败"
          : "处理中";

    document.getElementById("content-meta").innerHTML = `
            模型: <span class="model-badge ${data.model}">${data.model}</span> | 
            状态: ${statusIcon} ${statusText} | 
            时间: ${this.formatDateTime(data.created_at)}
        `;

    // 渲染解释内容 (Markdown)
    const explanation = data.content?.explanation || "";
    this.renderExplanation(explanation);

    // 渲染SVG
    this.renderSVG(data.animation?.svgCode || "");

    // 显示内容区域
    this.showContentState();
    this.switchTab("animation");

    // 添加成功动画
    if (data.status === "success") {
      document
        .getElementById("content-display")
        .classList.add("success-bounce");
      setTimeout(() => {
        document
          .getElementById("content-display")
          .classList.remove("success-bounce");
      }, 600);
    }
  }

  renderExplanation(explanation) {
    const container = document.getElementById("content-explanation");

    if (!explanation) {
      container.innerHTML = '<p class="text-gray-500 italic">暂无解释内容</p>';
      return;
    }

    try {
      // 使用 marked.js 解析 Markdown
      const htmlContent = marked.parse(explanation);
      container.innerHTML = htmlContent;

      // 添加额外的样式类
      container.querySelectorAll("p").forEach((p) => {
        p.classList.add("mb-3", "leading-relaxed");
      });

      container.querySelectorAll("strong").forEach((strong) => {
        strong.classList.add("font-semibold", "text-gray-900");
      });

      container.querySelectorAll("em").forEach((em) => {
        em.classList.add("italic", "text-gray-700");
      });
    } catch (error) {
      console.error("Failed to parse markdown:", error);
      // 回退到纯文本显示
      container.innerHTML = `<p>${this.escapeHtml(explanation)}</p>`;
    }
  }

  renderSVG(svgCode) {
    const container = document.getElementById("svg-container");
    const codeElement = document.getElementById("svg-code");

    if (svgCode && svgCode.trim()) {
      try {
        // 验证SVG代码
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgCode, "image/svg+xml");
        const parseError = doc.querySelector("parsererror");

        if (parseError) {
          throw new Error("SVG解析错误");
        }

        // 显示SVG动画
        container.innerHTML = svgCode;

        // 确保SVG有正确的viewBox（强制为1000x600）
        const svgElement = container.querySelector("svg");
        if (svgElement) {
          // 强制设置viewBox为1000x600
          svgElement.setAttribute("viewBox", "0 0 1000 600");

          // 移除固定的width/height属性，让它响应式
          svgElement.removeAttribute("width");
          svgElement.removeAttribute("height");

          // 设置响应式样式
          svgElement.style.width = "100%";
          svgElement.style.height = "auto";
          svgElement.style.maxWidth = "100%";
          svgElement.style.maxHeight = "400px"; // 限制最大高度，可调整
        }

        // 设置代码内容并高亮
        codeElement.textContent = this.formatSVGCode(svgCode);
        if (window.Prism) {
          Prism.highlightElement(codeElement);
        }

        // 添加SVG交互功能
        this.addSVGInteractions(container);
      } catch (error) {
        console.error("SVG rendering error:", error);
        container.innerHTML = `
                    <div class="text-red-500 text-center py-8">
                        <div class="text-4xl mb-2">⚠️</div>
                        <div>SVG渲染失败</div>
                        <div class="text-sm mt-1">代码可能有语法错误</div>
                    </div>
                `;
        codeElement.textContent = svgCode;
      }
    } else {
      container.innerHTML = `
                <div class="text-gray-400 text-center py-8">
                    <div class="text-4xl mb-2">📄</div>
                    <div>暂无SVG动画</div>
                </div>
            `;
      codeElement.textContent = "暂无代码";
    }
  }

  addSVGInteractions(container) {
    const svgElement = container.querySelector("svg");
    if (!svgElement) return;

    // 添加全屏预览功能
    svgElement.style.cursor = "pointer";
    svgElement.title = "点击全屏预览";

    svgElement.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showSVGFullscreen(svgElement.outerHTML);
    });

    // 添加hover效果
    svgElement.addEventListener("mouseenter", () => {
      container.style.backgroundColor = "#f8fafc";
    });

    svgElement.addEventListener("mouseleave", () => {
      container.style.backgroundColor = "";
    });
  }

  showSVGFullscreen(svgCode) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-4 max-w-4xl max-h-full overflow-auto relative">
                <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onclick="this.parentElement.parentElement.remove()">×</button>
                <div class="mt-6">
                    ${svgCode}
                </div>
                <div class="mt-4 text-center">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">关闭</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // 点击背景关闭
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  formatSVGCode(svgCode) {
    try {
      // 使用浏览器原生方法格式化XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(svgCode, "image/svg+xml");
      const serializer = new XMLSerializer();
      let formatted = serializer.serializeToString(xmlDoc.documentElement);

      // 简单的缩进处理
      formatted = formatted
        .replace(/></g, ">\n<")
        .split("\n")
        .map((line, index) => {
          const depth =
            (line.match(/</g) || []).length - (line.match(/</g) || []).length;
          return "  ".repeat(Math.max(0, depth)) + line.trim();
        })
        .join("\n");

      return formatted;
    } catch (error) {
      return svgCode;
    }
  }

  // ============ Tab切换功能 ============
  switchTab(tab) {
    this.currentTab = tab;

    const animationTab = document.getElementById("animation-tab");
    const codeTab = document.getElementById("code-tab");
    const animationView = document.getElementById("animation-view");
    const codeView = document.getElementById("code-view");

    if (tab === "animation") {
      // 切换到动画Tab
      animationTab.className =
        "px-3 py-1 text-sm font-medium rounded transition-colors bg-white text-gray-700 shadow-sm";
      codeTab.className =
        "px-3 py-1 text-sm font-medium rounded transition-colors text-gray-500 hover:text-gray-700";

      animationView.classList.remove("hidden");
      codeView.classList.add("hidden");
    } else {
      // 切换到代码Tab
      animationTab.className =
        "px-3 py-1 text-sm font-medium rounded transition-colors text-gray-500 hover:text-gray-700";
      codeTab.className =
        "px-3 py-1 text-sm font-medium rounded transition-colors bg-white text-gray-700 shadow-sm";

      animationView.classList.add("hidden");
      codeView.classList.remove("hidden");
    }
  }

  // ============ 历史记录功能 ============
  async loadHistoryList(searchKeyword = "") {
    const container = document.getElementById("history-list");
    const loading = document.getElementById("history-loading");
    const empty = document.getElementById("history-empty");

    try {
      // 显示加载状态
      loading.classList.remove("hidden");

      const params = new URLSearchParams({
        page: 1,
        page_size: 50,
        ...(searchKeyword && { keyword: searchKeyword }),
      });

      const response = await fetch(`/api/v1/history?${params}`);
      if (!response.ok) {
        throw new Error("获取历史记录失败");
      }

      const data = await response.json();
      this.renderHistoryList(data.items || []);
    } catch (error) {
      console.error("Failed to load history:", error);
      this.showHistoryError(error.message);
    } finally {
      loading.classList.add("hidden");
    }
  }

  renderHistoryList(items) {
    const container = document.getElementById("history-list");
    const empty = document.getElementById("history-empty");

    if (items.length === 0) {
      empty.classList.remove("hidden");
      container.innerHTML = "";
      return;
    }

    empty.classList.add("hidden");

    // 按日期分组
    const groupedItems = this.groupHistoryByDate(items);
    const html = Object.entries(groupedItems)
      .map(([date, items]) => this.createHistoryGroupHTML(date, items))
      .join("");

    container.innerHTML = html;
    this.bindHistoryItemEvents();
  }

  groupHistoryByDate(items) {
    const groups = {};

    items.forEach((item) => {
      const date = new Date(item.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey;
      if (this.isSameDay(date, today)) {
        groupKey = "今天";
      } else if (this.isSameDay(date, yesterday)) {
        groupKey = "昨天";
      } else {
        groupKey = date.toLocaleDateString("zh-CN", {
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }

  createHistoryGroupHTML(dateLabel, items) {
    const itemsHTML = items
      .map((item) => this.createHistoryItemHTML(item))
      .join("");

    return `
            <div class="history-group mb-3">
                <div class="text-xs font-medium text-gray-500 px-2 py-1 sticky top-0 bg-gray-50 border-b">
                    ${dateLabel} (${items.length})
                </div>
                <div class="space-y-1 p-1">
                    ${itemsHTML}
                </div>
            </div>
        `;
  }

  createHistoryItemHTML(item) {
    const statusIcon = this.getStatusIcon(item.status);
    const isSelected = item.id === this.selectedHistoryId;
    const timeStr = new Date(item.created_at).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
            <div class="history-item ${isSelected ? "selected" : ""}" data-id="${item.id}" title="${item.question}">
                <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm text-gray-800 truncate">
                            ${this.escapeHtml(item.question)}
                        </div>
                        <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span class="model-badge ${item.model}">${item.model}</span>
                            <span>${statusIcon}</span>
                            <span>${timeStr}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        ${item.status === "failed" ? '<button class="retry-btn text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200" data-id="' + item.id + '" title="重试">🔄</button>' : ""}
                        <button class="delete-btn p-1 text-gray-400 hover:text-red-500 text-xs" 
                                data-id="${item.id}" 
                                title="删除">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  bindHistoryItemEvents() {
    // 历史项点击事件
    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (
          e.target.classList.contains("delete-btn") ||
          e.target.classList.contains("retry-btn")
        ) {
          return;
        }
        const id = item.getAttribute("data-id");
        this.selectHistoryItem(id);
      });
    });

    // 删除按钮事件
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        this.deleteHistoryItem(id);
      });
    });

    // 重试按钮事件
    document.querySelectorAll(".retry-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        this.retryHistoryItem(id);
      });
    });
  }

  async selectHistoryItem(id) {
    try {
      this.showLoadingState();

      const response = await fetch(`/api/v1/history/${id}`);
      if (!response.ok) {
        throw new Error("获取历史记录失败");
      }

      const data = await response.json();

      // 转换为显示格式
      const displayData = {
        id: data.id,
        question: data.question,
        model: data.model,
        created_at: data.created_at,
        status: data.status,
        content: {
          explanation: data.explanation || "",
        },
        animation: {
          svgCode: data.svg_code || "",
        },
      };

      this.displayContent(displayData);
      this.updateHistorySelection(id);
    } catch (error) {
      console.error("Failed to load history item:", error);
      this.showToast("加载历史记录失败", "error");
      this.showErrorState("加载失败");
    }
  }

  updateHistorySelection(selectedId) {
    this.selectedHistoryId = selectedId;
    document.querySelectorAll(".history-item").forEach((item) => {
      const id = item.getAttribute("data-id");
      if (id === selectedId) {
        item.classList.add("selected");
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  async deleteHistoryItem(id) {
    const item = document.querySelector(`[data-id="${id}"]`);
    const question = item.querySelector(".font-medium").textContent.trim();

    if (!confirm(`确定要删除记录吗？\n\n"${question}"`)) {
      return;
    }

    try {
      // 添加删除动画
      item.style.opacity = "0.5";
      item.style.pointerEvents = "none";

      const response = await fetch(`/api/v1/history/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      this.showToast("记录已删除", "success");

      // 动画移除元素
      item.style.transform = "translateX(-100%)";
      setTimeout(() => {
        this.loadHistoryList();

        // 如果删除的是当前显示的项目，回到欢迎状态
        if (id === this.selectedHistoryId) {
          this.showWelcomeState();
          this.selectedHistoryId = null;
        }
      }, 300);
    } catch (error) {
      console.error("Failed to delete history item:", error);
      this.showToast("删除失败", "error");

      // 恢复元素状态
      item.style.opacity = "";
      item.style.pointerEvents = "";
    }
  }

  async retryHistoryItem(id) {
    try {
      const response = await fetch(`/api/v1/history/${id}`);
      if (!response.ok) {
        throw new Error("获取记录失败");
      }

      const data = await response.json();

      // 填充到输入框
      document.getElementById("question-input").value = data.question;
      document.getElementById("model-select").value = data.model;

      this.validateInput();
      this.showToast("已填充到输入框，可重新生成", "info");

      // 聚焦到生成按钮
      document.getElementById("generate-btn").focus();
    } catch (error) {
      console.error("Failed to retry item:", error);
      this.showToast("重试失败", "error");
    }
  }

  // ============ 搜索功能 ============
  async handleSearch(keyword) {
    const trimmedKeyword = keyword.trim();

    // 显示搜索状态
    if (trimmedKeyword) {
      this.showSearchIndicator();
    } else {
      this.hideSearchIndicator();
    }

    try {
      await this.loadHistoryList(trimmedKeyword);

      if (trimmedKeyword) {
        this.highlightSearchResults(trimmedKeyword);
      }
    } catch (error) {
      console.error("Search failed:", error);
      this.showToast("搜索失败", "error");
    }
  }

  showSearchIndicator() {
    const searchInput = document.getElementById("history-search");
    searchInput.style.backgroundColor = "#fef3c7";
    searchInput.style.borderColor = "#f59e0b";
  }

  hideSearchIndicator() {
    const searchInput = document.getElementById("history-search");
    searchInput.style.backgroundColor = "";
    searchInput.style.borderColor = "";
  }

  highlightSearchResults(keyword) {
    const items = document.querySelectorAll(".history-item .font-medium");
    items.forEach((item) => {
      const text = item.textContent;
      const highlightedText = text.replace(
        new RegExp(keyword, "gi"),
        (match) => `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`
      );
      item.innerHTML = highlightedText;
    });
  }

  // ============ 页面状态管理 ============
  showWelcomeState() {
    this.hideAllStates();
    document.getElementById("welcome-state").classList.add("show");
  }

  showLoadingState() {
    this.hideAllStates();
    document.getElementById("loading-state").classList.add("show");
  }

  showContentState() {
    this.hideAllStates();
    document.getElementById("content-display").classList.add("show");
  }

  showErrorState(message) {
    this.hideAllStates();
    document.getElementById("error-state").classList.add("show");
    document.getElementById("error-message").textContent = message;
  }

  hideAllStates() {
    [
      "welcome-state",
      "loading-state",
      "content-display",
      "error-state",
    ].forEach((id) => {
      document.getElementById(id).classList.remove("show");
    });
  }

  showHistoryError(message = "加载历史记录失败") {
    const container = document.getElementById("history-list");
    const loading = document.getElementById("history-loading");

    // 确保隐藏加载状态
    loading.classList.add("hidden");

    container.innerHTML = `
            <div class="text-center py-8 text-red-500 text-sm">
                <div class="text-2xl mb-2">❌</div>
                <div class="font-medium">${message}</div>
                <div class="mt-3 space-y-2">
                    <button onclick="window.physicsAdmin.loadHistoryList()" class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 mr-2">重试加载</button>
                    <button onclick="window.physicsAdmin.checkConnectivity()" class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">检查连接</button>
                </div>
                <div class="mt-2 text-xs text-gray-500">
                    打开浏览器控制台查看详细错误信息
                </div>
            </div>
        `;
  }

  // ============ 工具函数增强 ============
  autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  validateInput() {
    const input = document.getElementById("question-input");
    const btn = document.getElementById("generate-btn");
    const question = input.value.trim();

    // 实时字数统计
    const charCount = question.length;
    let statusText = "";

    if (charCount === 0) {
      btn.disabled = true;
      statusText = "";
    } else if (charCount < 5) {
      btn.disabled = true;
      statusText = `字数过少 (${charCount}/5)`;
    } else if (charCount > 500) {
      btn.disabled = true;
      statusText = `字数过多 (${charCount}/500)`;
      input.classList.add("border-red-300");
    } else {
      btn.disabled = false;
      statusText = `${charCount}/500`;
      input.classList.remove("border-red-300");
    }

    this.updateInputStatus(statusText, charCount > 500);
  }

  updateInputStatus(text, isError) {
    let statusEl = document.getElementById("input-status");
    if (!statusEl) {
      statusEl = document.createElement("div");
      statusEl.id = "input-status";
      statusEl.className = "text-xs mt-1 transition-colors";
      document
        .getElementById("question-input")
        .parentNode.appendChild(statusEl);
    }

    statusEl.textContent = text;
    statusEl.className = `text-xs mt-1 transition-colors ${isError ? "text-red-500" : "text-gray-400"}`;
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl + K: 快速聚焦到搜索框
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        document.getElementById("history-search").focus();
        return;
      }

      // Esc: 清空当前输入或搜索
      if (e.key === "Escape") {
        const activeEl = document.activeElement;
        if (activeEl.id === "question-input" && activeEl.value) {
          activeEl.value = "";
          this.validateInput();
        } else if (activeEl.id === "history-search" && activeEl.value) {
          activeEl.value = "";
          this.loadHistoryList();
        }
      }

      // Ctrl + 1/2: 快速切换Tab
      if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        this.switchTab("animation");
      }
      if (e.ctrlKey && e.key === "2") {
        e.preventDefault();
        this.switchTab("code");
      }
    });
  }

  async checkConnectivity() {
    console.log("检查API连接状态...");

    try {
      // 先检查基础健康状态
      const healthResponse = await fetch("/api/v1/health", {
        method: "GET",
        cache: "no-cache",
      });

      console.log(
        "Health check:",
        healthResponse.status,
        healthResponse.statusText
      );

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }

      // 再检查历史API是否可用
      const historyResponse = await fetch(
        "/api/v1/history?page=1&page_size=1",
        {
          method: "GET",
          cache: "no-cache",
        }
      );

      console.log(
        "History API check:",
        historyResponse.status,
        historyResponse.statusText
      );

      if (!historyResponse.ok) {
        console.warn(`History API不可用: ${historyResponse.status}`);
        this.showToast("历史记录API不可用，请检查后端服务", "warning");

        // 显示手动重试选项
        this.showHistoryError("历史记录API不可用，请检查后端服务是否正常运行");
        return;
      }

      const testData = await historyResponse.json();
      console.log("History API测试数据:", testData);
    } catch (error) {
      console.error("连接检查失败:", error);
      this.showToast(`无法连接到服务器: ${error.message}`, "warning");

      // 显示离线提示
      this.showHistoryError(`连接失败: ${error.message}`);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  copyCode() {
    const codeElement = document.getElementById("svg-code");
    const text = codeElement.textContent;

    if (!text || text === "暂无代码") {
      this.showToast("没有可复制的代码", "warning");
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showToast("代码已复制到剪贴板", "success");
          this.animateCopyButton();
        })
        .catch(() => {
          this.fallbackCopyText(text);
        });
    } else {
      this.fallbackCopyText(text);
    }
  }

  animateCopyButton() {
    const btn = document.getElementById("copy-code-btn");
    const originalText = btn.textContent;
    btn.textContent = "✅ 已复制";
    btn.classList.add("bg-green-100", "text-green-600");

    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("bg-green-100", "text-green-600");
    }, 2000);
  }

  fallbackCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      this.showToast("代码已复制到剪贴板", "success");
      this.animateCopyButton();
    } catch (err) {
      this.showToast("复制失败，请手动选择", "error");
    }

    document.body.removeChild(textarea);
  }

  showToast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // 限制Toast数量
    const existingToasts = container.children;
    if (existingToasts.length >= 3) {
      existingToasts[0].remove();
    }

    container.appendChild(toast);

    // 点击关闭
    toast.addEventListener("click", () => {
      toast.remove();
    });

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }

  getStatusIcon(status) {
    const icons = {
      success: "✅",
      failed: "❌",
      pending: "⏳",
    };
    return icons[status] || "❓";
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "刚刚";
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days === 1) {
      return (
        "昨天 " +
        date.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return (
        date.toLocaleDateString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
        }) +
        " " +
        date.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }

  // ============ 导出和高级功能 ============
  exportHistory() {
    if (!this.currentContent) {
      this.showToast("请先选择要导出的记录", "warning");
      return;
    }

    const data = {
      id: this.currentContent.id,
      question: this.currentContent.question,
      model: this.currentContent.model,
      explanation: this.currentContent.content?.explanation || "",
      svgCode: this.currentContent.animation?.svgCode || "",
      created_at: this.currentContent.created_at,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `physics_${this.currentContent.id.substring(0, 8)}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast("已导出JSON文件", "success");
  }

  downloadSVG() {
    if (!this.currentContent?.animation?.svgCode) {
      this.showToast("当前记录没有SVG内容", "warning");
      return;
    }

    const svgCode = this.currentContent.animation.svgCode;
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `physics_animation_${this.currentContent.id.substring(0, 8)}.svg`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast("已下载SVG文件", "success");
  }

  // 数据统计展示
  async showStats() {
    try {
      const response = await fetch("/api/v1/stats/summary");
      if (!response.ok) {
        throw new Error("获取统计信息失败");
      }

      const stats = await response.json();
      this.displayStats(stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
      this.showToast("统计信息获取失败", "error");
    }
  }

  displayStats(stats) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-full overflow-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">📊 使用统计</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700">×</button>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-blue-600">${stats.total_generations}</div>
                        <div class="text-sm text-gray-600">总生成数</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">${stats.successful_generations}</div>
                        <div class="text-sm text-gray-600">成功生成</div>
                    </div>
                </div>

                <div class="mb-4">
                    <h4 class="font-medium mb-2">模型使用情况</h4>
                    ${stats.by_model
                      .map(
                        (model) => `
                        <div class="flex justify-between items-center py-2">
                            <span class="model-badge ${model.model}">${model.model}</span>
                            <span class="font-medium">${model.count} 次</span>
                        </div>
                    `
                      )
                      .join("")}
                </div>

                <div class="flex justify-end">
                    <button onclick="this.parentElement.parentElement.remove()" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">关闭</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  // 右键菜单功能
  setupContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      const historyItem = e.target.closest(".history-item");
      if (historyItem) {
        e.preventDefault();
        this.showContextMenu(e, historyItem);
      }
    });

    // 点击其他地方关闭菜单
    document.addEventListener("click", () => {
      const existingMenu = document.querySelector(".context-menu");
      if (existingMenu) {
        existingMenu.remove();
      }
    });
  }

  showContextMenu(e, historyItem) {
    const existingMenu = document.querySelector(".context-menu");
    if (existingMenu) {
      existingMenu.remove();
    }

    const menu = document.createElement("div");
    menu.className =
      "context-menu fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50";
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";

    const id = historyItem.dataset.id;

    menu.innerHTML = `
            <button onclick="window.physicsAdmin.selectHistoryItem('${id}')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">查看详情</button>
            <button onclick="window.physicsAdmin.retryHistoryItem('${id}')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">重新生成</button>
            <hr class="my-1">
            <button onclick="window.physicsAdmin.deleteHistoryItem('${id}')" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">删除记录</button>
        `;

    document.body.appendChild(menu);

    // 确保菜单在视窗内
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = e.pageX - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = e.pageY - rect.height + "px";
    }
  }

  // 本地存储用户设置
  saveUserSettings() {
    const settings = {
      selectedModel: document.getElementById("model-select").value,
      lastUpdateCheck: Date.now(),
    };

    try {
      localStorage.setItem("physicsAdminSettings", JSON.stringify(settings));
    } catch (error) {
      // 忽略localStorage错误
    }
  }

  loadUserSettings() {
    try {
      const settings = JSON.parse(
        localStorage.getItem("physicsAdminSettings") || "{}"
      );

      if (settings.selectedModel) {
        document.getElementById("model-select").value = settings.selectedModel;
      }
    } catch (error) {
      // 忽略localStorage错误
    }
  }

  // 初始化时恢复用户设置
  initializeWithSettings() {
    this.loadUserSettings();

    // 监听设置变化
    document.getElementById("model-select").addEventListener("change", () => {
      this.saveUserSettings();
    });
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  window.physicsAdmin = new PhysicsAdmin();
});

// 全局函数导出，供HTML直接调用
window.showStats = () => window.physicsAdmin?.showStats();
window.downloadSVG = () => window.physicsAdmin?.downloadSVG();
window.exportHistory = () => window.physicsAdmin?.exportHistory();
