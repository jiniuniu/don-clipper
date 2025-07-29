新增组件

```
components/
├── demo/
│   ├── demo-card.tsx              # Demo预览卡片
│   ├── demo-search.tsx            # 搜索组件
│   ├── demo-hero-section.tsx      # 详情页Hero
│   ├── demo-content-section.tsx   # 详情页内容
│   ├── demo-action-section.tsx    # 详情页操作区
│   └── related-demos.tsx          # 相关推荐
├── layout/
│   ├── topbar.tsx                 # 重构支持多variant
│   └── home-hero.tsx              # 首页Hero区域
├── admin/
│   ├── demo-management.tsx        # Demo管理界面
│   ├── demo-editor.tsx            # Demo编辑器
│   └── analytics-dashboard.tsx    # 数据看板
└── search/
    ├── search-input.tsx           # 搜索输入框
    ├── search-results.tsx         # 搜索结果
    └── search-filters.tsx         # 搜索筛选
```

扩展`explanation`表

```typescript
// convex/schema.ts
explanations: defineTable({
  // 现有字段保持不变
  sessionId: v.optional(v.id("sessions")), // 改为可选
  question: v.string(),
  svgCode: v.optional(v.string()),
  explanation: v.optional(v.string()),
  relatedPhenomena: v.optional(v.array(v.string())),
  furtherQuestions: v.optional(v.array(v.string())),
  status: v.union(...),
  createdAt: v.number(),

  // 新增Demo相关字段
  isDemoContent: v.optional(v.boolean()),
  demoSlug: v.optional(v.string()),
  demoTitle: v.optional(v.string()), // 优化过的标题
  demoDescription: v.optional(v.string()), // 营销描述
  category: v.optional(v.string()),
  featured: v.optional(v.boolean()),
  publishedAt: v.optional(v.number()),
})
.index("by_session", ["sessionId"])
.index("by_demo", ["isDemoContent", "featured"])
.index("by_slug", ["demoSlug"])
.index("by_category", ["category"])
```

1. 新增搜索

```typescript
// convex/queries.ts
export const searchDemos = query({
  args: { keyword: v.string() },
  handler: async (ctx, { keyword }) => {
    // 在 question, demoTitle, keywords 中搜索
    const demos = await ctx.db
      .query("explanations")
      .withIndex("by_demo", (q) => q.eq("isDemoContent", true))
      .filter((q) =>
        q.or(
          q.contains(q.field("question"), keyword),
          q.contains(q.field("demoTitle"), keyword),
          q.contains(q.field("keywords"), keyword)
        )
      )
      .collect();
    return demos;
  },
});
```

2. Demo 详情页

```typescript
// app/demo/[slug]/page.tsx
export default function DemoDetailPage({ params }) {
  const demo = useQuery(api.queries.getDemoBySlug, { slug: params.slug });

  return (
    <div>
      <DemoHeroSection demo={demo} />
      <DemoContentSection demo={demo} />
      <DemoActionSection demo={demo} />
      <RelatedDemosSection demos={relatedDemos} />
    </div>
  );
}
```

3. 后台

```typescript
// app/admin/demos/page.tsx
-Demo列表管理 -
  创建 / 编辑Demo -
  设置featured状态 -
  批量操作 -
  数据统计 -
  // 功能包括：
  从Session中优质内容提升为Demo -
  AI批量生成Demo内容 -
  手动创建Demo -
  SEO优化设置;
```

4. 后台界面

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                SVG Content Editor                                       │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                                 Input Form                                              │
│                                                                                         │
│ Question:                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 为什么汽车转弯时需要减速？                                                            │
│ │                                                                                     │ │
│ │                                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ Category: [Classical Mechanics    ▼]     Subcategory: [Dynamics & Forces    ▼]        │
│                                                                                         │
│                          [Generate Content] [Generate SVG]                             │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                              Physics Content Details                                   │
│                                                                                         │
│ ┌─ Explanation ────────────────────────────────────────────────────────────────────┐   │
│ │ 车辆转弯需要向心力，由轮胎与地面摩擦力提供。根据F=mv²/R，速度越大所需向心力越大。   │
│ │ 当速度过大时，摩擦力不足以提供足够向心力，车辆会滑出弯道。因此转弯前必须减速，   │
│ │ 确保安全通过弯道。                                                               │
│ └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│ ┌─ Related Phenomena ──────────────────────────────────────────────────────────────┐   │
│ │ • 卫星轨道运动                                                                   │
│ │ • 离心机工作原理                                                                 │
│ │ • 赛车过弯技巧                                                                   │
│ └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│ ┌─ Further Questions ──────────────────────────────────────────────────────────────┐   │
│ │ • 为什么雨天更容易打滑？                                                         │
│ │ • 如何计算最佳过弯速度？                                                         │
│ │ • 倾斜弯道有什么优势？                                                           │
│ └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                                   SVG Editor                                           │
│                                                                                         │
├─────────────────────────────────────┬───────────────────────────────────────────────────┤
│                                     │                                                   │
│           SVG Preview               │                SVG Code Editor                   │
│                                     │                                                   │
│ ┌─────────────────────────────────┐ │ ┌───────────────────────────────────────────────┐ │
│ │  🔍 [50%] [75%] [100%] [125%]   │ │ │ 1  <svg viewBox="0 0 800 600"                │ │
│ │                                 │ │ │      xmlns="http://www.w3.org/2000/svg">      │ │
│ │  ┌─────────────────────────────┐│ │ │ 2    <!-- Background -->                      │ │
│ │  │                             ││ │ │ 3    <rect width="800" height="600"          │ │
│ │  │    [SVG RENDERS HERE]       ││ │ │           fill="#f0f8ff"/>                   │ │
│ │  │                             ││ │ │ 4                                             │ │
│ │  │     🏎️  ──→  🛣️             ││ │ │ 5    <!-- 道路弯道 -->                        │ │
│ │  │                             ││ │ │ 6    <path d="M 50 300 Q 400 50 750 300"    │ │
│ │  │    ⚡ Animation Playing      ││ │ │           stroke="#666" stroke-width="80"    │ │
│ │  │                             ││ │ │           fill="none" opacity="0.3"/>        │ │
│ │  │                             ││ │ │ 7                                             │ │
│ │  └─────────────────────────────┘│ │ │ 8    <!-- 高速车辆 -->                        │ │
│ │                                 │ │ │ 9    <g id="fast-car">                       │ │
│ │  ⏯️ [Play] ⏸️ [Pause] 🔄 [Reset]  │ │ │10      <rect x="180" y="220" width="40"      │ │
│ │                                 │ │ │           height="20" rx="3" fill="#FF6666" │ │
│ │  💾 Auto-saved 30s ago          │ │ │           transform="rotate(-30 200 230)">   │ │
│ └─────────────────────────────────┘ │ │11        <animateTransform                   │ │
│                                     │ │             attributeName="transform"        │ │
│                                     │ │12             type="rotate"                  │ │
│                                     │ │13             values="-30 200 230;           │ │
│                                     │ │                      -45 200 230;           │ │
│                                     │ │                      -60 200 230;           │ │
│                                     │ │                      -30 200 230"           │ │
│                                     │ │14             dur="4s"                       │ │
│                                     │ │15             repeatCount="indefinite"/>     │ │
│                                     │ │16      </rect>                               │ │
│                                     │ │17    </g>                                    │ │
│                                     │ │18                                            │ │
│                                     │ │19    <!-- Add more elements... -->          │ │
│                                     │ │20  </svg>                                    │ │
│                                     │ │                                              │ │
│                                     │ │ [Format Code] [Validate SVG]                │ │
│                                     │ └───────────────────────────────────────────────┘ │
│                                     │                                                   │
├─────────────────────────────────────┼───────────────────────────────────────────────────┤
│                                     │                                                   │
│          Drag to resize →           │                                                   │
│                                     │                                                   │
│                                     │                         [Save Changes]           │
│                                     │                                                   │
└─────────────────────────────────────┴───────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════

                                   Simplified Layout:

📝 INPUT FORM
   ├── Textarea for question
   ├── Category dropdown
   ├── Subcategory dropdown
   └── Generate buttons (two-stage)

📚 PHYSICS CONTENT (Above SVG)
   ├── Explanation card
   ├── Related phenomena list
   └── Further questions list

🔧 SVG EDITOR (Split 50/50)
   ├── Left: Live preview + controls
   ├── Right: Code editor
   ├── Auto-save indicator
   └── Single save button

════════════════════════════════════════════════════════════════════════════════════════════

```

```
1. Classical Mechanics

Kinematics (运动学)
Dynamics & Forces (动力学与力)
Rotational Motion (转动运动)
Oscillations & Vibrations (振动)
Elastic & Collision (弹性与碰撞)

2. Thermodynamics

Heat & Temperature (热与温度)
Heat Transfer (传热)
Phase Transitions (相变)
Thermodynamic Processes (热力学过程)
Statistical Mechanics (统计力学基础)

3. Electromagnetism

Electrostatics (静电学)
Electric Circuits (电路)
Magnetic Fields (磁场)
Electromagnetic Induction (电磁感应)
AC & DC Systems (交直流系统)

4. Wave Physics

Mechanical Waves (机械波)
Sound & Acoustics (声学)
Wave Interference (波的干涉)
Standing Waves (驻波)
Wave-Particle Duality (波粒二象性)

5. Optics

Geometric Optics (几何光学)
Wave Optics (波动光学)
Polarization (偏振)
Optical Instruments (光学仪器)
Laser & Modern Optics (激光与现代光学)

6. Fluid Mechanics

Fluid Statics (流体静力学)
Fluid Dynamics (流体动力学)
Viscosity & Turbulence (粘性与湍流)
Surface Tension (表面张力)
Aerodynamics (空气动力学)

7. Modern Physics

Quantum Mechanics (量子力学)
Atomic Structure (原子结构)
Nuclear Physics (核物理)
Special Relativity (狭义相对论)
Particle Physics (粒子物理)

8. Materials & Condensed Matter (新增分类)

Crystal Structure (晶体结构)
Phase Diagrams (相图)
Superconductivity (超导)
Semiconductor Physics (半导体物理)
Nanophysics (纳米物理)

9. Astrophysics & Cosmology

Planetary Motion (行星运动)
Stellar Evolution (恒星演化)
Gravitational Phenomena (引力现象)
Cosmological Models (宇宙学模型)
Space-Time (时空)

10. Biophysics

Biomechanics (生物力学)
Bioelectricity (生物电学)
Membrane Physics (膜物理)
Molecular Motors (分子马达)
Biophysical Modeling (生物物理建模)

11. Applied & Engineering Physics

Mechanical Engineering (机械工程)
Electronics & Circuits (电子与电路)
Energy Systems (能源系统)
Medical Physics (医学物理)
Environmental Physics (环境物理)

12. Everyday & Phenomenon Physics

Kitchen Physics (厨房物理)
Sports Physics (运动物理)
Weather & Climate (天气与气候)
Transportation (交通工具)
Household Phenomena (家庭现象)
```
