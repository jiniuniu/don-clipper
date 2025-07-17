```typescript
// 核心数据模型定义

// 基础位置和尺寸
interface Position {
  x: number; // 网格列位置 (0-11)
  y: number; // 网格行位置 (0-11)
  width: number; // 占据的列数
  height: number; // 占据的行数
}

// 样式配置
interface StyleConfig {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  padding?: "sm" | "md" | "lg";
  borderRadius?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
}

// 动画配置
interface AnimationConfig {
  type?: "fadeIn" | "slideIn" | "bounce" | "pulse" | "none";
  duration?: number; // 毫秒
  delay?: number; // 延迟毫秒
  trigger?: "auto" | "click" | "hover" | "scroll";
}

// 交互配置
interface InteractionConfig {
  clickable?: boolean;
  hoverable?: boolean;
  expandable?: boolean;
  tooltip?: string;
  onClick?: {
    action: "highlight" | "expand" | "navigate" | "showDetail";
    target?: string; // 目标元素ID
    content?: string;
  };
}

// 内容块基础接口
interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
  title?: string;
  description?: string;
  position: Position;
  style?: StyleConfig;
  animation?: AnimationConfig;
  interaction?: InteractionConfig;
  zIndex?: number;
  visible?: boolean;
}

// 内容块类型枚举
enum ContentBlockType {
  TEXT = "text",
  HEADING = "heading",
  CODE = "code",
  MATH = "math",
  DIAGRAM = "diagram",
  FLOWCHART = "flowchart",
  MERMAID = "mermaid",
  ASCII_ART = "ascii_art",
  SVG = "svg",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  INTERACTIVE_DEMO = "interactive_demo",
  QUIZ = "quiz",
  TIMELINE = "timeline",
  COMPARISON_TABLE = "comparison_table",
  PROCESS_STEPS = "process_steps",
  CONCEPT_MAP = "concept_map",
  FORMULA = "formula",
  CHART = "chart",
  ANNOTATION = "annotation",
  HIGHLIGHT_BOX = "highlight_box",
  CALLOUT = "callout",
  PROGRESS_BAR = "progress_bar",
  TABS = "tabs",
  ACCORDION = "accordion",
  SLIDER = "slider",
  TOGGLE = "toggle",
}

// 具体内容块类型定义

// 文本内容块
interface TextContentBlock extends BaseContentBlock {
  type: ContentBlockType.TEXT;
  content: string;
  markdown?: boolean;
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: number;
}

// 标题内容块
interface HeadingContentBlock extends BaseContentBlock {
  type: ContentBlockType.HEADING;
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  anchor?: string;
}

// 代码内容块
interface CodeContentBlock extends BaseContentBlock {
  type: ContentBlockType.CODE;
  content: string;
  language: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  executable?: boolean;
  expectedOutput?: string;
}

// 数学公式内容块
interface MathContentBlock extends BaseContentBlock {
  type: ContentBlockType.MATH;
  content: string; // LaTeX 格式
  inline?: boolean;
  numbering?: boolean;
}

// 图表内容块
interface DiagramContentBlock extends BaseContentBlock {
  type: ContentBlockType.DIAGRAM;
  diagramType:
    | "bar"
    | "line"
    | "pie"
    | "scatter"
    | "area"
    | "radar"
    | "tree"
    | "network";
  data: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
    grid?: boolean;
    responsive?: boolean;
  };
}

// 流程图内容块
interface FlowchartContentBlock extends BaseContentBlock {
  type: ContentBlockType.FLOWCHART;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  layout?: "horizontal" | "vertical" | "circular";
}

interface FlowchartNode {
  id: string;
  label: string;
  shape: "rectangle" | "circle" | "diamond" | "parallelogram";
  color?: string;
  position?: { x: number; y: number };
}

interface FlowchartEdge {
  source: string;
  target: string;
  label?: string;
  style?: "solid" | "dashed" | "dotted";
}

// Mermaid 图表内容块
interface MermaidContentBlock extends BaseContentBlock {
  type: ContentBlockType.MERMAID;
  content: string; // mermaid 语法
  theme?: "default" | "dark" | "forest" | "neutral";
}

// ASCII 艺术内容块
interface AsciiArtContentBlock extends BaseContentBlock {
  type: ContentBlockType.ASCII_ART;
  content: string;
  fontFamily?: "monospace" | "courier";
  preserveWhitespace?: boolean;
}

// SVG 内容块
interface SvgContentBlock extends BaseContentBlock {
  type: ContentBlockType.SVG;
  content: string; // SVG 代码
  viewBox?: string;
  preserveAspectRatio?: boolean;
}

// 图片内容块
interface ImageContentBlock extends BaseContentBlock {
  type: ContentBlockType.IMAGE;
  src: string;
  alt: string;
  caption?: string;
  objectFit?: "contain" | "cover" | "fill" | "scale-down";
}

// 交互式演示内容块
interface InteractiveDemoContentBlock extends BaseContentBlock {
  type: ContentBlockType.INTERACTIVE_DEMO;
  demoType:
    | "slider"
    | "button_group"
    | "input_output"
    | "visualization"
    | "simulation";
  config: {
    controls: DemoControl[];
    initialState: any;
    updateFunction: string; // 函数代码字符串
  };
}

interface DemoControl {
  type: "slider" | "input" | "select" | "button" | "checkbox";
  label: string;
  key: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  defaultValue: any;
}

// 测验内容块
interface QuizContentBlock extends BaseContentBlock {
  type: ContentBlockType.QUIZ;
  question: string;
  questionType:
    | "multiple_choice"
    | "true_false"
    | "fill_blank"
    | "short_answer";
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  hints?: string[];
}

// 时间线内容块
interface TimelineContentBlock extends BaseContentBlock {
  type: ContentBlockType.TIMELINE;
  events: TimelineEvent[];
  orientation?: "horizontal" | "vertical";
  showDates?: boolean;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  milestone?: boolean;
  color?: string;
}

// 对比表格内容块
interface ComparisonTableContentBlock extends BaseContentBlock {
  type: ContentBlockType.COMPARISON_TABLE;
  headers: string[];
  rows: ComparisonRow[];
  highlightDifferences?: boolean;
}

interface ComparisonRow {
  label: string;
  values: (string | number)[];
  highlight?: boolean;
}

// 步骤流程内容块
interface ProcessStepsContentBlock extends BaseContentBlock {
  type: ContentBlockType.PROCESS_STEPS;
  steps: ProcessStep[];
  layout?: "vertical" | "horizontal" | "circular";
  showProgress?: boolean;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  status?: "pending" | "active" | "completed";
  substeps?: ProcessStep[];
}

// 概念地图内容块
interface ConceptMapContentBlock extends BaseContentBlock {
  type: ContentBlockType.CONCEPT_MAP;
  concepts: ConceptNode[];
  relationships: ConceptRelationship[];
  centerConcept?: string;
}

interface ConceptNode {
  id: string;
  label: string;
  description?: string;
  level: number; // 层级
  color?: string;
  size?: "sm" | "md" | "lg";
}

interface ConceptRelationship {
  source: string;
  target: string;
  label: string;
  type: "is_a" | "part_of" | "causes" | "related_to" | "example_of";
}

// 标注内容块
interface AnnotationContentBlock extends BaseContentBlock {
  type: ContentBlockType.ANNOTATION;
  targetId: string; // 标注目标的ID
  content: string;
  annotationType: "arrow" | "highlight" | "circle" | "underline";
  position: "top" | "bottom" | "left" | "right";
}

// 选项卡内容块
interface TabsContentBlock extends BaseContentBlock {
  type: ContentBlockType.TABS;
  tabs: TabItem[];
  defaultActiveTab?: string;
  tabPosition?: "top" | "bottom" | "left" | "right";
}

interface TabItem {
  id: string;
  label: string;
  content: ContentBlock[]; // 嵌套内容块
  icon?: string;
}

// 折叠面板内容块
interface AccordionContentBlock extends BaseContentBlock {
  type: ContentBlockType.ACCORDION;
  sections: AccordionSection[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

interface AccordionSection {
  id: string;
  title: string;
  content: ContentBlock[]; // 嵌套内容块
  icon?: string;
}

// 联合类型定义
type ContentBlock =
  | TextContentBlock
  | HeadingContentBlock
  | CodeContentBlock
  | MathContentBlock
  | DiagramContentBlock
  | FlowchartContentBlock
  | MermaidContentBlock
  | AsciiArtContentBlock
  | SvgContentBlock
  | ImageContentBlock
  | InteractiveDemoContentBlock
  | QuizContentBlock
  | TimelineContentBlock
  | ComparisonTableContentBlock
  | ProcessStepsContentBlock
  | ConceptMapContentBlock
  | AnnotationContentBlock
  | TabsContentBlock
  | AccordionContentBlock;

// 主要的页面数据结构
interface TeachingPage {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // 分钟

  // 布局配置
  layout: {
    gridSize: { rows: number; cols: number };
    backgroundColor?: string;
    theme?: "light" | "dark" | "auto";
    responsive?: boolean;
  };

  // 内容块数组
  contentBlocks: ContentBlock[];

  // 页面级配置
  config: {
    showProgress?: boolean;
    enableNavigation?: boolean;
    autoPlay?: boolean;
    speed?: "slow" | "normal" | "fast";
  };

  // 元数据
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    tags: string[];
    language: string;
  };
}

// LLM 生成的结构化输出格式
interface LLMGeneratedContent {
  concept: string;
  explanation: string;
  page: TeachingPage;
  additionalNotes?: string;
  generationMetadata: {
    model: string;
    temperature: number;
    timestamp: string;
    processingTime: number;
  };
}

// 用户输入接口
interface UserInput {
  concept: string;
  context?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  preferredTypes?: ContentBlockType[];
  language?: string;
  customRequirements?: string;
}

export {
  ContentBlockType,
  Position,
  StyleConfig,
  AnimationConfig,
  InteractionConfig,
  ContentBlock,
  TeachingPage,
  LLMGeneratedContent,
  UserInput,
};
```
