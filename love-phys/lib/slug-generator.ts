// lib/slug-generator.ts
export function generateSlug(title: string): string {
  // 生成随机后缀
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  // 检查是否主要是英文内容
  const englishCharCount = (title.match(/[a-zA-Z]/g) || []).length;
  const totalCharCount = title.replace(/\s/g, "").length;
  const isMainlyEnglish = englishCharCount / totalCharCount > 0.7;

  if (isMainlyEnglish) {
    // 英文处理逻辑
    const slugBase = title
      .toLowerCase()
      // 移除特殊字符，保留字母、数字、空格、连字符
      .replace(/[^a-z0-9\s-]/g, "")
      // 将空格替换为连字符
      .replace(/\s+/g, "-")
      // 移除多余的连字符
      .replace(/-+/g, "-")
      // 移除首尾连字符
      .replace(/^-|-$/g, "")
      // 限制长度
      .substring(0, 50);

    return `${slugBase || "question"}-${randomSuffix}`;
  } else {
    // 非英文语言：使用长 ID
    const longId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return `question-${longId}`;
  }
}

// 验证 slug 是否有效
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 60;
}
