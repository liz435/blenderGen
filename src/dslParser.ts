import { SceneDSL, validateDSL } from './types/dsl.js';

/**
 * Parser for Scene DSL
 */
export class DSLParser {
  /**
   * Parse a JSON string into a SceneDSL object
   */
  parse(dslString: string): SceneDSL {
    try {
      const parsed = JSON.parse(dslString);
      
      if (!validateDSL(parsed)) {
        throw new Error('Invalid DSL structure');
      }
      
      return this.normalizeDSL(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`DSL parsing error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Normalize and add defaults to DSL
   */
  private normalizeDSL(dsl: SceneDSL): SceneDSL {
    return {
      ...dsl,
      camera: {
        fov: 75,
        ...dsl.camera
      },
      background: dsl.background || '#000000',
      objects: dsl.objects.map(obj => ({
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...obj,
        material: {
          type: 'standard',
          metalness: 0.5,
          roughness: 0.5,
          wireframe: false,
          ...obj.material
        }
      }))
    };
  }

  /**
   * Convert DSL object to formatted JSON string
   */
  stringify(dsl: SceneDSL): string {
    return JSON.stringify(dsl, null, 2);
  }
}
