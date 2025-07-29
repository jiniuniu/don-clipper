// lib/svg-formatter.ts - SVG 代码格式化工具
export function formatSVGCode(svgCode: string): string {
  if (!svgCode || typeof svgCode !== "string") {
    return svgCode;
  }

  try {
    // 首先尝试简单的格式化
    let formatted = svgCode.trim();

    // 移除多余的空白
    formatted = formatted.replace(/\s+/g, " ");

    // 在标签周围添加换行
    formatted = formatted
      // 在 > 后面添加换行（如果下一个字符是 <）
      .replace(/>\s*</g, ">\n<")
      // 在属性间添加适当的空格
      .replace(/\s*=\s*/g, "=")
      // 处理自闭合标签
      .replace(/\s*\/>/g, " />");

    // 分割成行并添加缩进
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const indentSize = 2;

    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      // 结束标签减少缩进
      if (trimmed.startsWith("</")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = " ".repeat(indentLevel * indentSize) + trimmed;

      // 开始标签增加缩进（除了自闭合标签和结束标签）
      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.endsWith("/>") &&
        !trimmed.includes("<!--")
      ) {
        indentLevel++;
      }

      return indentedLine;
    });

    return formattedLines.filter((line) => line.trim()).join("\n");
  } catch (error) {
    console.warn("Failed to format SVG code:", error);
    // 如果格式化失败，至少添加基本的换行
    return svgCode.replace(/></g, ">\n<");
  }
}

// 更简单的格式化版本
export function formatSVGCodeBasic(svgCode: string): string {
  if (!svgCode) return svgCode;

  return svgCode
    .replace(/></g, ">\n<") // 基本换行
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line, index, array) => {
      // 简单的缩进逻辑
      const isClosingTag = line.startsWith("</");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isOpeningTag =
        line.startsWith("<") && !line.startsWith("</") && !line.endsWith("/>");

      // 计算当前行应该的缩进级别
      let indent = 0;
      for (let i = 0; i < index; i++) {
        const prevLine = array[i];
        if (
          prevLine.startsWith("<") &&
          !prevLine.startsWith("</") &&
          !prevLine.endsWith("/>")
        ) {
          indent++;
        }
        if (prevLine.startsWith("</")) {
          indent--;
        }
      }

      if (isClosingTag) indent--;
      indent = Math.max(0, indent);

      return "  ".repeat(indent) + line;
    })
    .join("\n");
}
