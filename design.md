# Teaching Demo Creator - 项目文档

## 📋 项目概述

**Teaching Demo Creator** 是一个基于 AI 的交互式教学内容生成平台。用户输入学术概念，系统通过 LLM 生成结构化的多媒体教学演示页面，包含文本、图表、交互组件等多种内容类型。

### 核心功能

- 🤖 AI 驱动的内容生成
- 🎨 多样化的内容元素类型
- 📱 响应式交互设计
- 🗂️ 项目管理和历史记录
- ✏️ 实时预览和编辑

### 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI 组件**: shadcn/ui
- **后端**: Convex (serverless)
- **AI**: LangChain + OpenAI GPT-4
- **数据验证**: Zod
- **图表**: Recharts (MVP阶段)
- **数学公式**: KaTeX (后期添加)
- **代码高亮**: Prism.js (后期添加)

---

## 🏗️ 项目结构

```
teaching-demo-creator/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
│
├── convex/                          # Convex 后端
│   ├── _generated/
│   ├── actions/
│   │   └── generateContent.ts       # LLM 内容生成
│   ├── functions/
│   │   ├── projects.ts              # 项目 CRUD
│   │   └── contentBlocks.ts         # 内容块操作
│   ├── schema.ts                    # 数据库 Schema
│   └── convex.config.ts
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # 主页
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # 项目详情页
│   │   └── api/
│   │       └── webhooks/
│   │
│   ├── components/                  # React 组件
│   │   ├── ui/                      # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   ├── layout/                  # 布局组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── forms/                   # 表单组件
│   │   │   ├── ConceptForm.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── ValidationMessage.tsx
│   │   │
│   │   ├── content-blocks/          # 内容块组件 (MVP)
│   │   │   ├── TextBlock.tsx        # ✅ 最高优先级
│   │   │   ├── HeadingBlock.tsx     # ✅ 最高优先级
│   │   │   ├── HighlightBoxBlock.tsx # ✅ 最高优先级
│   │   │   ├── CalloutBlock.tsx     # ✅ 最高优先级
│   │   │   ├── DiagramBlock.tsx     # ✅ 简单图表
│   │   │   ├── ProcessStepsBlock.tsx # ✅ 中等优先级
│   │   │   └── BlockRenderer.tsx    # ✅ 统一渲染器
│   │   │   #
│   │   │   # 后期添加:
│   │   │   # ├── CodeBlock.tsx      # 🔄 需要语法高亮
│   │   │   # ├── MathBlock.tsx      # 🔄 需要 KaTeX
│   │   │   # ├── FlowchartBlock.tsx # 🔄 复杂交互
│   │   │   # ├── MermaidBlock.tsx   # 🔄 第三方依赖
│   │   │   # ├── AsciiArtBlock.tsx  # 🔄 简单但非核心
│   │   │   # ├── SvgBlock.tsx       # 🔄 需要 SVG 生成
│   │   │   # └── ConceptMapBlock.tsx # 🔄 复杂图形
│   │   │
│   │   ├── canvas/                  # 画布相关
│   │   │   ├── GridCanvas.tsx       # 网格画布
│   │   │   ├── BlockContainer.tsx   # 内容块容器
│   │   │   └── CanvasToolbar.tsx    # 画布工具栏
│   │   │
│   │   ├── generation/              # 生成相关
│   │   │   ├── GenerationProgress.tsx
│   │   │   ├── GenerationStatus.tsx
│   │   │   └── ProgressSteps.tsx
│   │   │
│   │   └── project/                 # 项目管理
│   │       ├── ProjectCard.tsx
│   │       ├── ProjectList.tsx
│   │       ├── ProjectPreview.tsx
│   │       └── ProjectActions.tsx
│   │
│   ├── lib/                         # 工具库
│   │   ├── convex.ts                # Convex 客户端
│   │   ├── llm/                     # LLM 相关
│   │   │   ├── generateContent.ts   # 内容生成逻辑
│   │   │   ├── prompts.ts           # Prompt 模板
│   │   │   └── schemas.ts           # Zod Schema
│   │   ├── utils/
│   │   │   ├── cn.ts                # className 工具
│   │   │   ├── validation.ts        # 验证工具
│   │   │   ├── layout.ts            # 布局计算
│   │   │   └── export.ts            # 导出功能
│   │   └── constants/
│   │       ├── contentTypes.ts      # 内容类型定义
│   │       ├── themes.ts            # 主题配置
│   │       └── defaults.ts          # 默认值
│   │
│   ├── hooks/                       # React Hooks
│   │   ├── useGeneration.ts         # 生成状态管理
│   │   ├── useProject.ts            # 项目操作
│   │   ├── useCanvas.ts             # 画布交互
│   │   ├── useLocalStorage.ts       # 本地存储
│   │   └── useDebounce.ts           # 防抖
│   │
│   ├── types/                       # TypeScript 类型
│   │   ├── index.ts                 # 主要类型导出
│   │   ├── content.ts               # 内容相关类型
│   │   ├── project.ts               # 项目相关类型
│   │   └── ui.ts                    # UI 相关类型
│   │
│   └── styles/                      # 样式文件
│       ├── globals.css
│       ├── components.css
│       └── blocks.css
│
├── public/                          # 静态资源
│   ├── icons/
│   ├── images/
│   └── favicon.ico
│
└── docs/                           # 文档
    ├── api.md
    ├── components.md
    └── deployment.md
```

---

## 📦 MVP 内容块类型 (渐进式开发)

### Phase 1: 核心文本内容 (最容易实现)

```typescript
// 优先级：🟢 高 - 立即实现
enum CoreContentTypes {
  TEXT = "text", // 🟢 基础文本，支持 markdown
  HEADING = "heading", // 🟢 标题，1-6 级别
  HIGHLIGHT_BOX = "highlight_box", // 🟢 信息框 (info/warning/success/error)
  CALLOUT = "callout", // 🟢 标注 (note/tip/warning)
}
```

### Phase 2: 基础可视化 (中等难度)

```typescript
// 优先级：🟡 中 - 第二阶段
enum VisualContentTypes {
  DIAGRAM = "diagram", // 🟡 简单图表 (bar/line/pie) - 使用 Recharts
  PROCESS_STEPS = "process_steps", // 🟡 步骤流程
}
```

### Phase 3: 高级内容 (后期添加)

```typescript
// 优先级：🔴 低 - 功能完善阶段
enum AdvancedContentTypes {
  CODE = "code", // 🔴 代码块 (需要 Prism.js)
  MATH = "math", // 🔴 数学公式 (需要 KaTeX)
  FLOWCHART = "flowchart", // 🔴 流程图 (复杂交互)
  MERMAID = "mermaid", // 🔴 Mermaid 图表
  ASCII_ART = "ascii_art", // 🔴 ASCII 艺术
  SVG = "svg", // 🔴 SVG 图形
  CONCEPT_MAP = "concept_map", // 🔴 概念地图
}
```

### 渐进式实现策略

**第一周目标**：

- ✅ TextBlock - 基础文本渲染
- ✅ HeadingBlock - 标题渲染
- ✅ HighlightBoxBlock - 信息提示框
- ✅ CalloutBlock - 标注组件

**第二周目标**：

- ✅ DiagramBlock - 基础图表 (仅 bar/line)
- ✅ ProcessStepsBlock - 步骤组件

**后续扩展**：
根据用户反馈逐步添加高级内容类型

### 1. 布局组件

#### `Layout.tsx`

```typescript
interface LayoutProps {
  children: React.ReactNode;
  sidebar?: boolean;
}
// 主布局容器，管理侧边栏和主内容区域
```

#### `Sidebar.tsx`

```typescript
interface SidebarProps {
  projects: Project[];
  currentProjectId?: string;
  onProjectSelect: (id: string) => void;
  onNewProject: () => void;
}
// 项目列表侧边栏，支持搜索和快速切换
```

### 2. 表单组件

#### `ConceptForm.tsx`

```typescript
interface ConceptFormProps {
  onSubmit: (data: UserInput) => void;
  loading?: boolean;
  initialData?: Partial<UserInput>;
}
// 概念输入表单，包含所有配置选项
```

### 3. 内容块组件

#### `BlockRenderer.tsx`

```typescript
interface BlockRendererProps {
  block: ContentBlock;
  editable?: boolean;
  onUpdate?: (block: ContentBlock) => void;
  onDelete?: (id: string) => void;
}
// 统一的内容块渲染器，根据类型动态渲染对应组件
```

#### `GridCanvas.tsx`

```typescript
interface GridCanvasProps {
  contentBlocks: ContentBlock[];
  gridSize: { rows: number; cols: number };
  editable?: boolean;
  onBlockUpdate?: (block: ContentBlock) => void;
}
// 网格画布，管理内容块的位置和布局
```

### 4. 生成进度组件

#### `GenerationProgress.tsx`

```typescript
interface GenerationProgressProps {
  status: GenerationStatus;
  progress: number;
  currentStep: string;
  onCancel?: () => void;
}
// 生成进度显示，包含步骤信息和取消功能
```

---

## 🔌 核心接口设计

### 1. Convex Functions

#### 项目管理

```typescript
// convex/functions/projects.ts

export const createProject = mutation({
  args: {
    title: v.string(),
    concept: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    generatedContent: v.any(), // LLMGeneratedContent
  },
  handler: async (ctx, args) => {
    // 创建新项目
  },
});

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    // 获取用户所有项目
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    // 获取特定项目详情
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    updates: v.object({
      title: v.optional(v.string()),
      contentBlocks: v.optional(v.any()),
      // ... 其他可更新字段
    }),
  },
  handler: async (ctx, args) => {
    // 更新项目
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    // 删除项目
  },
});
```

#### 内容生成

```typescript
// convex/actions/generateContent.ts

export const generateTeachingContent = action({
  args: {
    concept: v.string(),
    context: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    language: v.optional(v.string()),
    customRequirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 调用 LangChain + OpenAI 生成内容
    // 返回结构化的教学页面数据
  },
});
```

### 2. React Hooks

#### `useGeneration.ts`

```typescript
interface UseGenerationReturn {
  generate: (input: UserInput) => Promise<void>;
  status: "idle" | "generating" | "success" | "error";
  progress: number;
  currentStep: string;
  result: LLMGeneratedContent | null;
  error: string | null;
  cancel: () => void;
}

export function useGeneration(): UseGenerationReturn {
  // 管理内容生成的完整流程
}
```

#### `useProject.ts`

```typescript
interface UseProjectReturn {
  projects: Project[];
  currentProject: Project | null;
  createProject: (data: CreateProjectInput) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function useProject(): UseProjectReturn {
  // 项目管理相关操作
}
```

---

## 📊 数据模型

### 1. 数据库 Schema (Convex)

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    title: v.string(),
    concept: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    estimatedTime: v.number(),

    // 页面配置
    layout: v.object({
      gridSize: v.object({
        rows: v.number(),
        cols: v.number(),
      }),
      backgroundColor: v.optional(v.string()),
      theme: v.optional(
        v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))
      ),
    }),

    // 内容块数据
    contentBlocks: v.array(v.any()), // ContentBlock[]

    // 元数据
    metadata: v.object({
      author: v.string(),
      language: v.string(),
      tags: v.array(v.string()),
      version: v.string(),
    }),

    // 系统字段
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.string()), // 用户ID（如果有用户系统）
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"])
    .searchIndex("search_projects", {
      searchField: "title",
      filterFields: ["userId", "difficulty"],
    }),

  generations: defineTable({
    projectId: v.id("projects"),
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    progress: v.number(),
    currentStep: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),

    // 生成参数
    input: v.object({
      concept: v.string(),
      context: v.optional(v.string()),
      difficulty: v.optional(v.string()),
      language: v.optional(v.string()),
      customRequirements: v.optional(v.string()),
    }),

    // LLM 元数据
    generationMetadata: v.optional(
      v.object({
        model: v.string(),
        temperature: v.number(),
        processingTime: v.number(),
      })
    ),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),
});
```

### 2. TypeScript 类型定义

参考前面设计的完整数据模型，包括：

- `ContentBlock` 联合类型
- `TeachingPage` 接口
- `UserInput` 接口
- `LLMGeneratedContent` 接口

---

## 🎯 核心功能流程

### 1. 内容生成流程

```
用户输入表单 → 表单验证 → 调用 Convex Action →
LangChain + OpenAI → 结构化输出 → 存储到数据库 →
实时更新前端状态 → 显示生成结果
```

### 2. 项目管理流程

```
创建项目 → 自动保存到侧边栏 → 支持编辑和预览 →
可以重新生成 → 支持导出和分享
```

### 3. 实时编辑流程

```
点击内容块 → 进入编辑模式 → 修改属性 →
实时预览 → 保存更改 → 更新数据库
```

---

## 🚀 开发计划

### Phase 1: MVP 基础 (1周) - 立即可用

- [ ] 项目初始化 + shadcn/ui 配置
- [ ] 基础布局 (无侧边栏版本)
- [ ] Convex 集成
- [ ] 简单表单 (仅概念输入)
- [ ] 4个核心内容块: text, heading, highlight_box, callout

### Phase 2: 核心功能 (1周) - 基本可用

- [ ] LangChain + OpenAI 集成 (简化 prompt)
- [ ] 内容生成 Action
- [ ] 网格画布系统 (固定布局)
- [ ] 基础图表 (bar/line chart)

### Phase 3: 产品化 (1周) - 完整体验

- [ ] 侧边栏和项目管理
- [ ] 生成进度显示
- [ ] 步骤流程组件
- [ ] 基础编辑功能

### Phase 4: 扩展功能 (后续迭代)

- [ ] 高级内容块 (code, math, flowchart 等)
- [ ] 实时编辑和拖拽
- [ ] 导出和分享
- [ ] 移动端优化

---

## 📦 依赖包清单

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "convex": "^1.0.0",
    "@langchain/openai": "^0.0.0",
    "@langchain/core": "^0.0.0",
    "langchain": "^0.0.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.3.0",

    // shadcn/ui 相关
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^1.2.0",
    "@radix-ui/react-progress": "^1.0.0",
    "@radix-ui/react-toast": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.292.0",

    // MVP 阶段的最小依赖
    "recharts": "^2.8.0", // 基础图表
    "react-markdown": "^9.0.0", // Markdown 渲染
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0"

    // 后期添加:
    // "mermaid": "^10.6.0",      // 🔄 Phase 4
    // "katex": "^0.16.0",        // 🔄 Phase 4
    // "prismjs": "^1.29.0",      // 🔄 Phase 4
    // "framer-motion": "^10.0.0" // 🔄 动画 (可选)
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🔧 环境配置

### 环境变量

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# OpenAI
OPENAI_API_KEY=

# 其他配置
NEXT_PUBLIC_APP_URL=
NODE_ENV=development
```

### 部署配置

- **前端**: Vercel
- **后端**: Convex (serverless)
- **监控**: Vercel Analytics + Convex Dashboard
