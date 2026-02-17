import OpenAI from 'openai';
import { SceneDSL, createDefaultDSL } from './types/dsl.js';
import { DSLParser } from './dslParser.js';

/**
 * Service for interacting with OpenAI API to generate scene DSL
 */
export class OpenAIService {
  private openai: OpenAI;
  private parser: DSLParser;
  private model: string;

  constructor(apiKey?: string, model: string = 'gpt-4-turbo-preview') {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    this.parser = new DSLParser();
    this.model = model;
  }

  /**
   * Generate DSL from natural language prompt
   */
  async generateDSL(prompt: string): Promise<SceneDSL> {
    const systemPrompt = this.buildSystemPrompt();
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parser.parse(content);
    } catch (error) {
      console.error('Error generating DSL:', error);
      throw new Error(`Failed to generate scene DSL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refine existing DSL with additional prompt
   */
  async refineDSL(currentDSL: SceneDSL, refinementPrompt: string): Promise<SceneDSL> {
    const systemPrompt = this.buildSystemPrompt();
    const currentDSLString = this.parser.stringify(currentDSL);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Current scene DSL:\n${currentDSLString}\n\nRefinement request: ${refinementPrompt}` }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parser.parse(content);
    } catch (error) {
      console.error('Error refining DSL:', error);
      throw error;
    }
  }

  /**
   * Build the system prompt for the AI
   */
  private buildSystemPrompt(): string {
    const exampleDSL = createDefaultDSL();
    exampleDSL.objects = [
      {
        type: 'cube',
        position: [0, 1, 0],
        rotation: [0, 0.785, 0],
        scale: [1, 1, 1],
        material: {
          type: 'standard',
          color: '#ff0000',
          metalness: 0.5,
          roughness: 0.5
        }
      }
    ];

    return `You are a 3D scene generation assistant. Convert natural language descriptions into a JSON DSL for Three.js scenes.

The DSL schema:
- camera: {position: [x,y,z], lookAt: [x,y,z], fov?: number}
- lights: array of {type: 'ambient'|'directional'|'point'|'spot', color: string, intensity: number, position?: [x,y,z]}
- objects: array of {
    type: 'cube'|'sphere'|'plane'|'cylinder'|'cone'|'torus',
    position: [x,y,z],
    rotation?: [x,y,z] (in radians),
    scale?: [x,y,z],
    material: {
      type: 'basic'|'standard'|'phong'|'lambert',
      color: string (hex),
      metalness?: 0-1,
      roughness?: 0-1,
      wireframe?: boolean
    }
  }
- background?: string (hex color)

Example DSL:
${JSON.stringify(exampleDSL, null, 2)}

Rules:
1. Always return valid JSON matching this schema
2. Use reasonable default values for camera and lighting if not specified
3. Position units are arbitrary 3D space units
4. Colors must be hex format (e.g., '#ff0000')
5. Rotation is in radians (0 to 2π)
6. Keep scenes reasonably sized (objects between -10 and 10 in each axis)
7. Always include at least one light source

Return ONLY the JSON, no explanations.`;
  }
}
