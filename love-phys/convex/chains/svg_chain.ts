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
- **Animation Effects**: Must add SVG animations when phenomena involve motion or changing processes
  - Use <animateTransform>, <animate>, <animateMotion> and other tags
  - Examples: wave propagation, particle motion, light refraction, magnetic field changes, etc.
  - Animation duration recommended 2-4 seconds, can loop continuously
  - Animation starting states must match physical initial conditions
- **Layered Display**: Complex phenomena should be shown step-by-step, use <g> groups for management
  - Background environment layer, main objects layer, annotation text layer
  - Can use opacity or transform to achieve layering effects
- **Interactive Elements**: Add appropriate hover effects and visual feedback
  - Important elements change color or size on hover
  - Use gradients and shadows to enhance three-dimensional feel

## Physics Accuracy Requirements
- **Accurate Proportions**: Ensure proportions, angles, and directions comply with physics laws
- **Initial Condition Setup**: Ensure all motion and changes start from correct physical initial states
- **Coordinate System Consistency**: Animation coordinate transforms must align with actual physical coordinate systems
- **Perspective Rationality**: Choose optimal viewing angles based on phenomenon characteristics, prioritize top-down or isometric views for 3D phenomena
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
- Use <text> tags to add physical quantity annotations
- Important parameters in bold, units must be indicated
- Arrow directions must be accurate, length represents magnitude
- Text size appropriate, ensure readability

## Special Phenomenon Handling Strategies
- **Wave Phenomena**: Must show wave propagation animation with sine curves and phase changes
- **Motion Trajectory Phenomena**: 
  - Projectile motion: Ensure initial position at ground or launch point, trajectory follows gravity
  - Circular motion: For car turning, planetary motion, etc., prioritize top-down view perspective
  - 3D motion: Use appropriate projection angles, avoid perspective confusion
  - Periodic motion: Ensure starting state matches physical initial conditions
- **Perspective Selection Principles**:
  - Circular motion, rotational phenomena: Prioritize top-down or front view
  - Projectile motion: Use side view to show complete trajectory
  - Wave propagation: Choose angle that best shows propagation direction
  - Complex 3D phenomena: Select perspective with maximum information and minimum ambiguity
- **Electromagnetic Phenomena**: Use field lines and color gradients to represent field strength, electric field lines from positive to negative
- **Thermodynamic Phenomena**: Use particle motion speed and density to represent temperature levels
- **Optical Phenomena**: Accurately show light paths, incident angles, refraction angles, and reflection angles
- **Mechanical Phenomena**: Clearly indicate force directions and magnitudes

## SVG Format Requirements
- **JSON Safety**: All double quotes in SVG code must be replaced with single quotes
- **Escape Characters**: Avoid backslashes, newlines, and other special characters
- **Simplified Structure**: Reduce complex nesting and overly long attribute values
- **Performance Optimization**: Avoid overly complex paths, reasonably use <defs> to define repeated elements

## Accessibility
- Add <title> and <desc> tags to describe image content
- Use semantic element structure
- Ensure sufficient contrast

## Critical Reminders
- **Ground-level Start**: For bouncing, falling, or jumping objects, always start from ground level (bottom of viewBox), not mid-air
- **Coordinate Direction**: Remember SVG Y-axis is inverted - upward physical movement requires negative Y animation values
- **3D Visualization**: For circular paths, orbital motion, or rotational phenomena, default to top-down view unless side view provides clearer understanding
- **Physical Realism**: Every animation should begin from a state that makes physical sense in the real world

Example format:
svgCode: "<svg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'>...</svg>"

## Input Information
**User Question**: {question}

**Physics Explanation**: {explanation}

**Related Phenomena**: {relatedPhenomena}

Please create an accurate, clear, and visually appealing SVG physics demonstration diagram based on the above explanation.

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

  const prompt = PromptTemplate.fromTemplate(SVG_PROMPT_TMPL);
  const chain = prompt.pipe(llm).pipe(parser);

  return await chain.invoke({
    question,
    explanation,
    relatedPhenomena: relatedPhenomena.join(", "),
    format_instructions: parser.getFormatInstructions(),
  });
}
