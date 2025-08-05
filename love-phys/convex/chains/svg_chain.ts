import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const SVGGenerationSchema = z.object({
  svgCode: z.string().min(100, "SVG code must be substantial"),
});

export type SVGGeneration = z.infer<typeof SVGGenerationSchema>;

export const SVG_PROMPT_TMPL = `You are a professional physics diagram designer who creates accurate, clear, and visually appealing SVG demonstration diagrams based on provided physics explanations.

## SVG Technical Requirements
- **Responsive Design**: Use appropriate viewBox, recommended ratios 2:1, 3:2, or 4:3
- **Flexible Dimensions**: Choose appropriate size based on content complexity, width recommended 600-1200px
- **Coordinate System Understanding**: 
  - SVG coordinate system has Y-axis positive downward, consider actual physical directions when designing animations
  - Object initial positions should be set at reasonable physical starting points (ground level, container bottom, etc.)
  - Animation transform values' positive/negative directions must align with physical intuition (upward movement uses negative Y values)
  - Ensure motion starts from physically correct initial states, not arbitrary mid-positions

## Spatial Layout Strategy
### **Phase Positioning Guidelines**
- **Sequential Animations**: Plan distinct screen regions for each phase's explanatory text
  - Phase 1: Left region (x=50-300)
  - Phase 2: Center region (x=350-650) 
  - Phase 3: Right region (x=700-950)
  - Additional phases: Use top/bottom regions or corners (y=50-150 for top, y=400-500 for bottom)
  
### **Text Placement Rules**
- **Never overlap text elements** from different animation phases
- **Reserve dedicated zones** for phase descriptions (top corners, side margins)
- **Maintain consistent text anchoring** within each zone
- **Consider text bounding boxes** when planning animations

### **Layout Planning Checklist**
Before creating SVG, explicitly plan:
1. Which screen regions each phase will use for text
2. How many simultaneous text elements will be visible
3. Whether any animations might cause text to intersect
4. Fallback positioning for complex multi-phase sequences

## Animation Design Strategy
### **Educational Animation Principles**
- **Phase-based Design**: For multi-step phenomena, design distinct phases that can be easily understood
- **Extended Duration**: Use longer animation cycles (8-20 seconds) to allow proper comprehension
- **Strategic Timing**: Each phase should have sufficient display time for reading and understanding

### **Animation Timing Guidelines**
- **Simple Continuous Motion**: 3-6 seconds per cycle (bouncing ball, wave propagation)
- **Multi-phase Processes**: 12-20 seconds total cycle
  - Each phase: 3-6 seconds minimum display time
  - Transitions: 0.5-1 second between phases
- **Complex Demonstrations**: Consider breaking into persistent phases rather than fade in/out

### **Animation Implementation Approaches**
**Option A: Persistent Multi-phase Display**
- Show all phases simultaneously in different areas
- Use spatial separation instead of temporal transitions
- Best for: Process comparisons, before/after states

**Option B: Sequential Phase Animation**
- Use opacity transitions with extended hold times
- Animation pattern: values='0;0;0;1;1;1;0;0' (longer hold in middle)
- Include adequate pause time between phases for comprehension

**Option C: Progressive Reveal**
- Elements remain visible once introduced
- Each new phase adds to existing content
- Best for: Building complex systems step by step

### **Animation Coordination Requirements**
- **Text Positioning**: Each phase's explanatory text must have dedicated screen coordinates
- **Overlap Prevention**: Use transform or absolute positioning to separate concurrent text
- **Reading Flow**: Position text to guide natural reading progression (left→right, top→bottom)
- **Visual Hierarchy**: Primary phase text should be most prominent, secondary text smaller/lower contrast

### **Multi-Phase Animation Implementation**
**Critical Rule**: When using opacity-based phase transitions, assign unique coordinates to each phase's text elements.

**Alternative Approaches**:
- **Vertical Stacking**: Use different Y coordinates (y=80, y=200, y=320)
- **Corner Placement**: Utilize all four corners for up to 4 phases
- **Dynamic Positioning**: Use <animateTransform> to move text to different positions

### **Animation Effects**
- Use <animateTransform>, <animate>, <animateMotion> tags appropriately
- **Continuous phenomena**: Seamless loops (wave motion, rotation)
- **Process demonstrations**: Extended cycles with clear phases
- **Interactive elements**: Hover effects and visual feedback
- Animation starting states must match physical initial conditions

## Enhanced User Experience
### **Reading Time Considerations**
- **Text Heavy Phases**: Minimum 4-6 seconds display time
- **Complex Diagrams**: 5-8 seconds per phase
- **Simple Visual Changes**: 2-3 seconds minimum

### **Visual Hierarchy**
- **Primary Process**: Most prominent animation and positioning
- **Secondary Details**: Subtle animations that don't distract
- **Annotations**: Clear, readable text with sufficient contrast
- **Progress Indicators**: Consider adding phase indicators for long sequences

### **Layered Display Strategy**
- Background environment layer (persistent)
- Main process layer (animated according to strategy chosen)
- Annotation layer (synchronized with main process)
- Detail/zoom layer (optional, for complex phenomena)

## Physics Accuracy Requirements
- **Accurate Proportions**: Ensure proportions, angles, and directions comply with physics laws
- **Initial Condition Setup**: Ensure all motion and changes start from correct physical initial states
- **Coordinate System Consistency**: Animation coordinate transforms must align with actual physical coordinate systems
- **Perspective Rationality**: Choose optimal viewing angles based on phenomenon characteristics
- **Force Representation**: Force directions must be correct, arrow length represents force magnitude
- **Vector Properties**: Follow the vector nature of physical quantities
- **Energy Conservation**: Energy transformation processes must follow conservation laws

## Color Standards
- **Temperature**: Red = hot, Blue = cold
- **Electric Charge**: Red = positive charge, Blue = negative charge
- **Velocity**: Green arrows indicate velocity direction
- **Energy**: Yellow represents high energy, Purple represents low energy
- **Magnetic Field**: Blue represents N pole, Red represents S pole

## Annotation Requirements
- Use <text> tags with appropriate font sizes (12-16px for main text, 10-12px for labels)
- Important parameters in bold, units must be indicated
- Arrow directions accurate, length represents magnitude
- Ensure text remains readable throughout animation cycles
- Consider text animation synchronization with main process

## Special Phenomenon Handling
### **Process-Heavy Phenomena** (freezing, chemical reactions, phase transitions)
- **Recommended**: Sequential phase approach with extended display times
- Each major stage: 4-6 seconds minimum
- Include transitional states: 1-2 seconds
- Total cycle: 15-25 seconds

### **Motion Phenomena** (projectile, wave, rotation)
- **Recommended**: Continuous loop approach
- Cycle duration: 3-6 seconds
- Ensure smooth, physically realistic motion
- Consider adding trail effects for trajectory visualization

### **Comparison Phenomena** (before/after, different conditions)
- **Recommended**: Persistent multi-phase display
- Use spatial separation or synchronized animations
- Allow simultaneous viewing of different states

## Animation Duration Decision Matrix
| Phenomenon Type | Recommended Approach | Duration Guidelines |
|-----------------|---------------------|-------------------|
| Simple motion | Continuous loop | 3-6 sec cycles |
| Multi-step process | Sequential phases | 4-6 sec per phase |
| State transitions | Progressive reveal | 3-5 sec per state |
| Comparisons | Persistent display | Static or synchronized |
| Complex systems | Layered revelation | 5-8 sec per layer |

## Layout Validation Checklist
Before finalizing SVG design:
- [ ] No text elements share the same coordinates across different phases
- [ ] All text remains within viewBox boundaries throughout animation
- [ ] Text contrast is sufficient against background in all phases
- [ ] Reading time matches animation phase duration
- [ ] Text positioning follows natural reading flow
- [ ] Critical information is never obscured by overlapping elements

## SVG Format Requirements
- **JSON Safety**: All double quotes in SVG code must be replaced with single quotes
- **Escape Characters**: Avoid backslashes, newlines, and other special characters
- **Simplified Structure**: Reduce complex nesting, use <defs> for repeated elements
- **Performance Optimization**: Optimize for smooth animation playback

## Accessibility
- Add <title> and <desc> tags describing the physical phenomenon
- Use semantic structure with clear visual hierarchy
- Ensure sufficient contrast for all text elements
- Consider animation accessibility (avoid seizure-inducing effects)

## Critical Design Decisions
Before creating the SVG, explicitly consider:
1. **Is this a continuous process or discrete phases?**
2. **How much text/information needs reading time?**
3. **Would users benefit from seeing multiple states simultaneously?**
4. **What is the optimal balance between animation complexity and educational clarity?**
5. **How many distinct text regions are needed for all phases?**
6. **Where will each phase's explanatory text be positioned to avoid overlaps?**
7. **Do any animations risk causing text collisions?**

## Input Information
**User Question**: {question}

**Physics Explanation**: {explanation}

**Related Phenomena**: {relatedPhenomena}

Please create an accurate, clear, and educational SVG physics demonstration diagram. Consider the animation timing strategy most appropriate for this specific phenomenon. CRITICAL: Plan text positioning for each phase to prevent overlaps.

{format_instructions}`;

export const SVG_PROMPT_TMPL_SIMPLE = `Create an educational SVG physics diagram based on the provided explanation.

## Core Requirements

### Technical Setup
- Use viewBox='0 0 1000 600' with responsive design
- Replace all double quotes with single quotes for JSON safety
- Include <title> and <desc> tags for accessibility

### Animation Strategy
Choose the most appropriate approach:
- **Simple Motion**: Continuous loops (3-6 sec cycles) for waves, rotation, oscillation
- **Multi-Step Process**: Sequential phases (4-6 sec per phase) for complex phenomena
- **Comparisons**: Side-by-side layout for different states/conditions

### Physics Accuracy
- Correct initial positions (objects start from physically realistic locations)
- Proper coordinate system (Y+ downward in SVG, but animations should feel natural)
- Accurate proportions, forces, and directions
- Follow conservation laws and physical principles

### Visual Design
- **Colors**: Red=hot/positive, Blue=cold/negative, Green=velocity, Yellow=energy
- **Text**: 12-16px main text, 10-12px labels, ensure readability
- **Layout**: Prevent text overlaps - use different regions for each phase
- **Animations**: Smooth, educational pacing with adequate viewing time

### Critical Layout Rule
**Text Positioning**: Each animation phase must use different screen coordinates to prevent overlaps:
- Phase 1: Left region (x=50-300)
- Phase 2: Center region (x=350-650)  
- Phase 3: Right region (x=700-950)

## Input Information
**Question**: {question}
**Explanation**: {explanation}
**Related**: {relatedPhenomena}

Create a clear, accurate SVG that demonstrates the physics concept effectively.

{format_instructions}`;

export const SVG_PROMPT_TMPL_ENHANCED = `Create an educational SVG physics diagram based on the provided explanation.

## Technical Setup
- Use viewBox='0 0 1000 600' with single quotes throughout
- Include <title> and <desc> tags for accessibility

## Animation Scenario Selection

### Scenario 1: Simple Motion - Continuous/Repetitive Phenomena
**Physical Examples**:
- **Waves**: Sound waves, light waves, water waves, electromagnetic waves, standing waves
- **Vibrations**: Pendulum swing, spring oscillation, molecular vibration, harmonic motion
- **Rotations**: Planet orbits, electron shells, gyroscope motion, turbine spinning
- **Flows**: Electric current, heat conduction, fluid streams, magnetic field lines
- **Periodic**: AC voltage cycles, breathing motion, heartbeat, tidal motion

**Use When**: Phenomenon repeats continuously without distinct stages
**Code Pattern**:
\`\`\`xml
<animateTransform attributeName='transform' type='rotate' 
  values='0 cx cy; 360 cx cy' dur='3s' repeatCount='indefinite' />
\`\`\`

### Scenario 2: Multi-Phase Process - Sequential Transformations
**Physical Examples**:
- **State Changes**: Ice→Water→Steam, Solid→Liquid→Gas transitions
- **Chemical Reactions**: Reactants→Activation→Intermediates→Products
- **Formation Processes**: Star birth (nebula→protostar→main sequence), crystal growth, tornado formation
- **Nuclear Processes**: Radioactive decay chains, fission (neutron→impact→split→energy)
- **Biological**: Photosynthesis steps, cell division phases, enzyme catalysis
- **Engineering**: Engine cycles (intake→compression→combustion→exhaust)
- **Geological**: Earthquake (stress→rupture→waves→aftershocks)

**Use When**: Process has distinct beginning→middle→end stages with different mechanisms
**Code Pattern**:
\`\`\`xml
<!-- CRITICAL: Use animate for opacity, NOT animateTransform -->
<g id='phase1'>
  <animate attributeName='opacity' values='1;1;0;0;0;0' dur='18s' repeatCount='indefinite' />
</g>
<g id='phase2'>  
  <animate attributeName='opacity' values='0;0;1;1;0;0' dur='18s' repeatCount='indefinite' />
</g>
<g id='phase3'>
  <animate attributeName='opacity' values='0;0;0;0;1;1' dur='18s' repeatCount='indefinite' />
</g>
\`\`\`

### Scenario 3: Before/After Comparison - State Contrasts
**Physical Examples**:
- **Temperature Effects**: Hot vs cold material properties, thermal expansion
- **Chemical States**: Before vs after reaction, catalyst effects
- **Electrical**: Charged vs neutral objects, conductor vs insulator
- **Mechanical**: Before vs after collision, elastic vs inelastic deformation
- **Optical**: Polarized vs unpolarized light, reflection vs refraction

**Use When**: Showing two contrasting states or conditions
**Code Pattern**:
\`\`\`xml
<g id='before'>
  <animate attributeName='opacity' values='1;1;0;0' dur='8s' repeatCount='indefinite' />
</g>
<g id='after'>
  <animate attributeName='opacity' values='0;0;1;1' dur='8s' repeatCount='indefinite' />
</g>
\`\`\`

## Quick Selection Guide
**Ask yourself:**
1. **Repeats forever?** → Simple Motion (waves, orbits, oscillations)
2. **Has clear stages?** → Multi-Phase (formation, reactions, transformations)  
3. **Comparing states?** → Before/After (hot vs cold, before vs after reaction)

## Animation Rules
1. **Opacity**: Always use \`<animate attributeName='opacity'>\` for phase visibility
2. **Timing**: All related phases must have identical \`dur\` values  
3. **Values**: For N phases, divide timeline equally with N value pairs each
4. **Motion**: Use \`animateTransform\` for movement, \`animate\` for properties

## Common Animation Patterns
\`\`\`xml
<!-- Rotation around center -->
<animateTransform attributeName='transform' type='rotate' 
  values='0 500 300; 360 500 300' dur='4s' repeatCount='indefinite' />

<!-- Flow/Current visualization -->
<animate attributeName='stroke-dasharray' values='0,100; 100,0' dur='2s' repeatCount='indefinite' />

<!-- Pulsing/Breathing effect -->
<animate attributeName='r' values='5; 15; 5' dur='3s' repeatCount='indefinite' />

<!-- Wave motion -->
<animateTransform attributeName='transform' type='translate' 
  values='0,0; 0,-20; 0,0' dur='2s' repeatCount='indefinite' />
\`\`\`

## Layout & Design
- **Phase Text Zones**: Phase 1 (x=50-300), Phase 2 (x=350-650), Phase 3 (x=700-950)
- **Colors**: Red=hot/positive/energy, Blue=cold/negative, Green=velocity/motion, Yellow=energy/attention
- **Text**: 16px titles, 12px descriptions, 10px labels

## Physics Accuracy
- Start objects in realistic positions based on the physical scenario
- Follow conservation laws (energy, momentum, charge) throughout animation
- Use accurate proportions and directions for forces and motions
- Animate gravity effects downward (increasing Y values)

## Validation Checklist
- [ ] Animation scenario matches the physical phenomenon type
- [ ] All phases appear in correct sequence during animation
- [ ] No text overlaps between phases  
- [ ] All \`dur\` values match for related animations
- [ ] Physics principles correctly represented

## Input Information
**Question**: {question}
**Explanation**: {explanation}
**Related**: {relatedPhenomena}

First identify which scenario best fits the phenomenon, then implement using the corresponding code pattern.

{format_instructions}`;

export async function createSVGLLM() {
  return new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    modelName: "anthropic/claude-sonnet-4",
    temperature: 0.2, // Use lower temperature for SVG generation to ensure accuracy
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}

export async function generateSVGFromContent(
  question: string,
  explanation: string,
  relatedPhenomena: string[]
): Promise<SVGGeneration> {
  const llm = await createSVGLLM();
  const parser = StructuredOutputParser.fromZodSchema(SVGGenerationSchema);

  const prompt = PromptTemplate.fromTemplate(SVG_PROMPT_TMPL_ENHANCED);
  const chain = prompt.pipe(llm).pipe(parser);

  return await chain.invoke({
    question,
    explanation,
    relatedPhenomena: relatedPhenomena.join(", "),
    format_instructions: parser.getFormatInstructions(),
  });
}
