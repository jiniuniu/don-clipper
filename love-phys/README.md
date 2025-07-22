# Love Physics - MVP 设计文档

## 项目概述

Love Physics 是一个基于 AI 的物理学教育应用，用户可以输入自然现象描述，系统生成包含 SVG 图示、原理解释、相关现象和延伸问题的教育内容。

## 技术架构

```
Frontend (Next.js)
├── 用户界面组件
├── 状态管理 (Convex Hooks)
└── 实时订阅

Backend (Convex)
├── 数据存储 (Convex DB)
├── 业务逻辑 (Actions/Mutations)
└── LLM 集成 (LangChain + OpenRouter)

AI Pipeline
├── LangChain + Zod 验证
├── 对话历史构建
└── 结构化输出
```

## 项目结构

```
love-physics/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── components.json            # shadcn 配置
├── .env.local
│
├── convex/                     # 后端逻辑
│   ├── _generated/
│   ├── schema.ts              # 数据模型定义
│   ├── queries.ts             # 数据查询
│   ├── mutations.ts           # 数据修改
│   ├── actions.ts             # LLM 集成
│   └── lib/
│       ├── llm.ts             # LangChain 配置
│       └── validation.ts      # Zod 验证模式
│
├── app/                       # Next.js App Router (无 src)
│   ├── layout.tsx
│   ├── page.tsx              # 主页面
│   ├── globals.css
│   └── favicon.ico
│
├── components/                # UI 组件
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── main-content.tsx
│   │   └── header.tsx
│   │
│   ├── session/
│   │   ├── session-list.tsx
│   │   ├── session-item.tsx
│   │   └── new-session-button.tsx
│   │
│   ├── explanation/           # 重命名：更语义化
│   │   ├── explanation-card.tsx
│   │   ├── svg-display.tsx
│   │   ├── explanation-text.tsx
│   │   ├── related-phenomena.tsx
│   │   ├── further-questions.tsx
│   │   └── loading-explanation.tsx
│   │
│   ├── input/
│   │   ├── question-input.tsx      # 空状态页面的输入框
│   │   ├── chat-input.tsx          # 底部固定的对话输入
│   │   └── empty-state.tsx
│   │
│   └── ui/                    # shadcn 基础组件
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── scroll-area.tsx
│       └── textarea.tsx
│
├── hooks/                     # 自定义 Hooks
│   ├── use-physics.ts         # 主要业务逻辑
│   ├── use-sessions.ts        # Session 管理
│   ├── use-explanations.ts    # Explanation 操作
│   └── use-auto-scroll.ts     # 自动滚动
│
├── lib/                       # 工具函数
│   ├── utils.ts               # shadcn utils
│   └── constants.ts
│
├── types/                     # 类型定义
│   ├── physics.ts
│   └── index.ts
│
└── public/
    └── logo.svg
```

## 核心数据模型

### Session 模型

```typescript
interface Session {
  _id: Id<"sessions">;
  title: string; // 会话标题（基于第一个问题）
  createdAt: number; // 创建时间戳
  updatedAt: number; // 最后更新时间戳
}
```

### Explanation 模型

```typescript
interface Explanation {
  _id: Id<"explanations">;
  sessionId: Id<"sessions">;
  question: string; // 用户问题
  svgCode?: string; // SVG 图示代码
  explanation?: string; // 物理原理解释
  relatedPhenomena?: string[]; // 相关现象列表
  furtherQuestions?: string[]; // 延伸问题列表
  status: "generating" | "completed" | "failed";
  createdAt: number;
}
```

### LLM 响应模型

```typescript
interface PhysicsExplanation {
  svgCode: string;
  explanation: string;
  relatedPhenomena: string[3]; // 固定 3 个
  furtherQuestions: string[3]; // 固定 3 个
}
```

## 后端架构设计

### Queries (数据查询)

- `getSessions()` - 获取所有会话列表
- `getSession(sessionId)` - 获取单个会话详情
- `getSessionExplanations(sessionId)` - 获取会话中的所有解释
- `getExplanation(explanationId)` - 获取单个解释详情

### Mutations (数据操作)

- `createSession(title)` - 创建新会话
- `updateSession(sessionId)` - 更新会话时间戳
- `createExplanation(sessionId, question)` - 创建新解释
- `updateExplanation(explanationId, data)` - 更新解释内容
- `deleteSession(sessionId)` - 删除会话及其所有解释

### Actions (业务逻辑)

- `generatePhysicsExplanation(sessionId?, question)` - 生成物理解释
- `retryGeneration(explanationId)` - 重试失败的生成

### LLM 集成模块

- 对话历史构建
- LangChain + Zod 管道
- 错误处理和重试机制

## AI 处理逻辑

### 对话历史构建

```typescript
// 从当前 Session 的解释记录构建对话历史
async function buildConversationHistory(sessionId: string) {
  const explanations = await getSessionExplanations(sessionId);

  const messages = [];
  for (const explanation of explanations) {
    if (explanation.status === "completed") {
      // 用户问题
      messages.push({
        role: "user",
        content: explanation.question,
      });

      // AI 解释（只使用核心解释文本）
      if (explanation.explanation) {
        messages.push({
          role: "assistant",
          content: explanation.explanation,
        });
      }
    }
  }

  return messages;
}
```

### LangChain + Zod 处理管道

```typescript
// Zod 验证模式
const PhysicsExplanationSchema = z.object({
  svgCode: z.string().min(1, "SVG code is required"),
  explanation: z.string().min(50, "Explanation must be at least 50 characters"),
  relatedPhenomena: z
    .array(z.string())
    .length(3, "Must have exactly 3 related phenomena"),
  furtherQuestions: z
    .array(z.string())
    .length(3, "Must have exactly 3 further questions"),
});

// LangChain 管道
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  modelName: "anthropic/claude-3.5-sonnet",
  temperature: 0.7,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

// 带验证的生成管道
const response = await llm
  .pipe((output) => {
    const parsed = JSON.parse(output.content as string);
    return PhysicsExplanationSchema.parse(parsed);
  })
  .invoke(messages);
```

### 系统提示词设计

```
你是一个物理学教育助手，专门帮助用户理解自然现象背后的物理原理。

## 任务
根据用户描述的现象和对话历史，生成一个完整的物理解释，包含：
1. SVG代码 - 直观展示物理概念
2. 核心解释 - 简洁清晰的原理说明
3. 相关现象 - 3个类似的现象
4. 进一步探索 - 3个相关问题

## SVG要求
- 尺寸：viewBox="0 0 800 400"
- 简洁清晰，避免过于复杂
- 使用鲜明的颜色对比
- 包含必要的标签和箭头
- 能够直观展示物理过程或概念

## 解释要求
- 从现象出发，解释背后的物理原理
- 语言通俗易懂，避免过于专业的术语
- 重点突出因果关系
- 200-400字长度
- 考虑对话历史的连贯性

## 相关现象要求
- 基于相同或相似的物理原理
- 贴近日常生活或自然界
- 简洁描述，每个3-8个字

## 进一步探索要求
- 基于当前解释延伸的问题
- 能够引发用户思考
- 每个问题控制在15字以内

请以JSON格式回复，包含svgCode、explanation、relatedPhenomena、furtherQuestions四个字段。
```

### 完整处理流程

```typescript
export const generatePhysicsExplanation = action({
  args: { sessionId: v.optional(v.id("sessions")), question: v.string() },
  handler: async (ctx, { sessionId, question }) => {
    try {
      // 1. 创建或获取 Session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await ctx.runMutation(api.mutations.createSession, {
          title: question.slice(0, 30) + (question.length > 30 ? "..." : ""),
        });
      }

      // 2. 创建 generating 状态的解释记录
      const explanationId = await ctx.runMutation(api.mutations.createExplanation, {
        sessionId: currentSessionId,
        question,
      });

      // 3. 构建对话历史（仅使用 question 和 explanation 文本）
      const conversationHistory = await buildConversationHistory(ctx, currentSessionId);

      // 4. 准备 LLM 消息
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: "user", content: question },
      ];

      // 5. LangChain + Zod 处理管道
      const llm = new ChatOpenAI({...});
      const response = await llm.pipe(
        (output) => {
          const parsed = JSON.parse(output.content as string);
          return PhysicsExplanationSchema.parse(parsed);
        }
      ).invoke(messages);

      // 6. 更新解释记录
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        svgCode: response.svgCode,
        explanation: response.explanation,
        relatedPhenomena: response.relatedPhenomena,
        furtherQuestions: response.furtherQuestions,
        status: "completed",
      });

      // 7. 更新 Session 时间戳
      await ctx.runMutation(api.mutations.updateSession, {
        sessionId: currentSessionId,
      });

      return { sessionId: currentSessionId, explanationId, success: true };

    } catch (error) {
      // 错误处理：标记解释为失败状态
      if (explanationId) {
        await ctx.runMutation(api.mutations.updateExplanation, {
          explanationId,
          status: "failed",
        });
      }
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
  },
});
```

### 状态管理和实时更新

- **生成状态**：explanation 创建时状态为 "generating"
- **实时订阅**：前端通过 Convex 订阅实时获取状态变化
- **渐进显示**：可以显示加载状态，完成后显示完整内容
- **错误处理**：失败时显示错误状态和重试选项

### 上下文管理策略

- **精简历史**：只使用 question 和 explanation 文本构建上下文
- **排除冗余**：不包含 SVG、相关现象等结构化数据
- **保持连贯**：确保对话的逻辑连续性
- **长度控制**：可以限制历史记录数量避免 token 超限

## 前端组件设计

### 布局组件

#### `Sidebar`

- 功能：会话管理侧边栏
- Props：`sessions`, `activeSessionId`, `onSessionSelect`
- 状态：折叠/展开状态
- 子组件：`SessionList`, `NewSessionButton`

#### `MainContent`

- 功能：主要内容区域
- Props：`sessionId?`
- 条件渲染：空状态 vs 解释列表

### 会话管理组件

#### `SessionList`

- 功能：会话列表展示
- Props：`sessions`, `activeSessionId`, `onSessionSelect`
- 排序：按更新时间倒序

#### `SessionItem`

- 功能：单个会话项
- Props：`session`, `isActive`, `onClick`
- 样式：活跃状态高亮

#### `NewSessionButton`

- 功能：创建新会话按钮
- 行为：清空当前选择，显示空状态

### 解释组件

#### `ExplanationCard`

- 功能：物理解释卡片容器
- Props：`explanation`
- 布局：问题标题 + 内容区域 + 交互区域
- 基于：shadcn `Card` 组件

#### `SVGDisplay`

- 功能：SVG 图示展示
- Props：`svgCode`, `title`
- 特性：响应式尺寸，错误处理

#### `ExplanationText`

- 功能：原理解释文本
- Props：`explanation`
- 样式：可读性优化

#### `RelatedPhenomena`

- 功能：相关现象列表
- Props：`phenomena`
- 布局：横向标签样式
- 基于：shadcn `Badge` 组件

#### `FurtherQuestions`

- 功能：延伸问题按钮组
- Props：`questions`, `onQuestionClick`
- 交互：点击继续对话
- 基于：shadcn `Button` 组件

#### `LoadingExplanation`

- 功能：生成中的加载状态
- 特性：骨架屏或动画效果
- 基于：shadcn `Skeleton` 组件

### 输入组件

#### `QuestionInput`

- 功能：问题输入框（空状态页面专用）
- Props：`onSubmit`, `disabled`
- 特性：自动聚焦，回车提交，大号居中样式
- 基于：shadcn `Textarea` 组件

#### `ChatInput`

- 功能：底部固定的对话输入组件
- Props：`onSubmit`, `disabled`, `placeholder`
- 位置：主内容区域底部固定
- 特性：自适应高度，支持多行输入
- 基于：shadcn `Textarea` + `Button` 组件

#### `EmptyState`

- 功能：空状态页面
- 内容：Logo + 说明 + 示例问题
- 交互：点击示例问题开始对话

## Hooks 设计

### `usePhysics`

```typescript
interface UsePhysicsReturn {
  // 状态
  sessions: Session[];
  currentSession: Session | null;
  explanations: Explanation[];
  isGenerating: boolean;

  // 操作
  askQuestion: (question: string, sessionId?: string) => Promise<void>;
  selectSession: (sessionId: string) => void;
  createNewSession: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  retryGeneration: (explanationId: string) => Promise<void>;
}
```

### `useSessions`

```typescript
interface UseSessionsReturn {
  sessions: Session[];
  createSession: (title: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  isLoading: boolean;
}
```

### `useExplanations`

```typescript
interface UseExplanationsReturn {
  explanations: Explanation[];
  getSessionExplanations: (sessionId: string) => Explanation[];
  isGenerating: boolean;
  retry: (explanationId: string) => Promise<void>;
}
```

### `useAutoScroll`

```typescript
interface UseAutoScrollReturn {
  scrollRef: RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  // 新解释卡片生成时自动滚动到底部
  // 用户可以向上滚动查看历史解释
  // 类似聊天应用的滚动行为
}
```

## 用户交互流程

### 新用户流程

#### 第一步：空状态页面

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       🔬 Love Physics                          │
│                   探索自然现象背后的物理原理                     │
│                                                                 │
│                                                                 │
│            ┌─────────────────────────────────────────┐        │
│            │  描述一个你好奇的自然现象或生活现象...    │        │
│            │                                         │        │
│            └─────────────────────────────────────────┘        │
│                            [开始探索]                          │
│                                                                 │
│                                                                 │
│               💡 试试这些问题:                                   │
│            • 为什么彩虹是弯的？                                 │
│            • 肥皂泡为什么是彩色的？                             │
│            • 为什么冰比水轻？                                   │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 第二步：生成解释后的完整界面

```
                                ↓ 用户输入问题
┌─────────────────────────────────────────────────────────────────┐
│                        Love Physics                             │
├───────────┬─────────────────────────────────────────────────────┤
│           │  ┌─────────────────────────────────────────────────┐ │
│ Sessions  │  │ 📋 为什么天空是蓝色的？                          │ │
│           │  ├─────────────────────────────────────────────────┤ │
│ ┌───────┐ │  │ ┌─────────────────────────────────┐ ┌─────────┐ │ │
│ │Session│ │  │ │                                 │ │💡相关现象│ │ │
│ │  #1   │ │  │ │          SVG 图示               │ │• 日出    │ │ │
│ │ 光学  │ │  │ │        ☀️ → 🌍 → 👁          │ │• 日落    │ │ │
│ │ 活跃  │ │  │ │      (瑞利散射示意图)           │ │• 蓝宝石  │ │ │
│ └───────┘ │  │ │                                 │ └─────────┘ │ │
│           │  │ └─────────────────────────────────┘             │ │
│ + 新对话  │  ├─────────────────────────────────────────────────┤ │
│           │  │ 🔍 光的散射原理解释内容...                       │ │
│           │  ├─────────────────────────────────────────────────┤ │
│           │  │ ❓ 继续探索                                     │ │
│           │  │ [为什么日落是红色的？] [为什么海水是蓝色的？]    │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                     │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ 继续提问...                                     │ │
│           │  │ ┌─────────────────────────────────────────────┐ │ │
│           │  │ │ 输入新问题...                               │ │ │
│           │  │ └─────────────────────────────────────────────┘ │ │
│           │  │                                  [发送]        │ │
│           │  └─────────────────────────────────────────────────┘ │
└───────────┴─────────────────────────────────────────────────────┘
```

1. 进入应用 → 显示空状态页面（全屏居中输入）
2. 输入问题 → 创建新 Session，界面切换到左右分栏布局
3. 生成解释 → 显示完整解释卡片，自动滚动到底部
4. 点击延伸问题 → 使用底部 ChatInput 继续对话

### 返回用户流程

#### 第一步：初始状态（空主界面）

```
┌─────────────────────────────────────────────────────────────────┐
│                        Love Physics                             │
├───────────┬─────────────────────────────────────────────────────┤
│           │                                                     │
│ Sessions  │                   🔬 Love Physics                   │
│           │               探索自然现象背后的物理原理              │
│ ┌───────┐ │                                                     │
│ │Session│ │        ┌─────────────────────────────────────────┐  │
│ │  #1   │ │        │  描述一个你好奇的自然现象或生活现象...    │  │
│ │ 光学  │ │        │                                         │  │
│ └───────┘ │        └─────────────────────────────────────────┘  │
│           │                        [开始探索]                   │
│ ┌───────┐ │                                                     │
│ │Session│ │           💡 试试这些问题:                           │
│ │  #2   │ │        • 为什么彩虹是弯的？                         │
│ │ 力学  │ │        • 肥皂泡为什么是彩色的？                     │
│ └───────┘ │        • 为什么冰比水轻？                           │
│           │                                                     │
│ + 新对话  │                                                     │
└───────────┴─────────────────────────────────────────────────────┘
```

#### 第二步：选择历史 Session 后（可滚动的对话流）

```
                                ↓ 点击选择 Session #1
┌─────────────────────────────────────────────────────────────────┐
│                        Love Physics                             │
├───────────┬─────────────────────────────────────────────────────┤
│           │ ↑ 可向上滚动查看历史                                 │
│ Sessions  │  ┌─────────────────────────────────────────────────┐ │
│           │  │ 📋 为什么天空是蓝色的？                          │ │
│ ┌───────┐ │  ├─────────────────────────────────────────────────┤ │
│ │Session│ │  │ ┌─────────────────────────────────┐ ┌─────────┐ │ │
│ │  #1   │ │  │ │                                 │ │💡相关现象│ │ │
│ │ 光学  │ │  │ │          SVG 图示               │ │• 日出    │ │ │
│ │ 活跃  │ │  │ │        ☀️ → 🌍 → 👁          │ │• 日落    │ │ │
│ └───────┘ │  │ │      (瑞利散射示意图)           │ │• 蓝宝石  │ │ │
│           │  │ │                                 │ └─────────┘ │ │
│ ┌───────┐ │  │ └─────────────────────────────────┘             │ │
│ │Session│ │  ├─────────────────────────────────────────────────┤ │
│ │  #2   │ │  │ 🔍 光的散射原理解释内容...                       │ │
│ │ 力学  │ │  ├─────────────────────────────────────────────────┤ │
│ └───────┘ │  │ ❓ 继续探索                                     │ │
│           │  │ [为什么日落是红色的？] [为什么海水是蓝色的？]    │ │
│ + 新对话  │  └─────────────────────────────────────────────────┘ │
│           │                                                     │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ 📋 为什么日落是红色的？                          │ │
│           │  │ (第二个解释卡片，向下追加)                       │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                     │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ 📋 为什么海水是蓝色的？                          │ │
│           │  │ (第三个解释卡片，继续向下)                       │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                     │
│           │ ↓ 新内容自动滚动到此处                               │
│           │ ┌─────────────────────────────────────────────────┐ │
│           │ │ 继续提问...                                     │ │
│           │ │ ┌─────────────────────────────────────────────┐ │ │
│           │ │ │ 输入新问题...                               │ │ │
│           │ │ └─────────────────────────────────────────────┘ │ │
│           │ │                                  [发送]        │ │
│           │ └─────────────────────────────────────────────────┘ │
└───────────┴─────────────────────────────────────────────────────┘
```

1. 进入应用 → 显示 Session 列表 + 空状态主界面（类似新用户）
2. 选择历史 Session → 主界面显示该 Session 的所有解释卡片（时间顺序，可滚动）
3. 继续提问 → 新解释卡片向下追加，自动滚动到底部显示 ChatInput

### 错误处理流程

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 为什么水会结冰？                                              │
├─────────────────────────────────────────────────────────────────┤
│ ❌ 生成失败                                                     │
│                                                                 │
│ 抱歉，生成解释时出现错误。请点击重试或重新提问。                 │
│                                                                 │
│                      [重试] [重新提问]                          │
└─────────────────────────────────────────────────────────────────┘
```

1. 生成失败 → 显示错误状态解释卡片
2. 提供重试按钮 → 重新生成
3. 网络错误 → 友好提示
