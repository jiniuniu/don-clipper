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
- **Animation Effects**: Must add SVG animations when phenomena involve motion or changing processes
  - Use <animateTransform>, <animate>, <animateMotion> and other tags
  - Examples: wave propagation, particle motion, light refraction, magnetic field changes, etc.
  - Animation duration recommended 2-4 seconds, can loop continuously
- **Layered Display**: Complex phenomena should be shown step-by-step, use <g> groups for management
  - Background environment layer, main objects layer, annotation text layer
  - Can use opacity or transform to achieve layering effects
- **Interactive Elements**: Add appropriate hover effects and visual feedback
  - Important elements change color or size on hover
  - Use gradients and shadows to enhance three-dimensional feel

## Physics Accuracy Requirements
- **Accurate Proportions**: Ensure proportions, angles, and directions comply with physics laws
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
