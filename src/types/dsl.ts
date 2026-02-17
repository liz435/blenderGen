/**
 * DSL Type Definitions for Three.js Scene Generation
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type Vector3Array = [number, number, number];

export interface CameraConfig {
  position: Vector3Array;
  lookAt: Vector3Array;
  fov?: number;
}

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color: string;
  intensity: number;
  position?: Vector3Array;
  target?: Vector3Array;
}

export interface MaterialConfig {
  type: 'basic' | 'standard' | 'phong' | 'lambert';
  color: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
}

export interface ObjectConfig {
  type: 'cube' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus';
  position: Vector3Array;
  rotation?: Vector3Array;
  scale?: Vector3Array;
  material: MaterialConfig;
  // Geometry-specific properties
  radius?: number;
  width?: number;
  height?: number;
  depth?: number;
  segments?: number;
}

export interface SceneDSL {
  camera: CameraConfig;
  lights: LightConfig[];
  objects: ObjectConfig[];
  background?: string;
}

/**
 * Validates a scene DSL object
 */
export function validateDSL(dsl: any): dsl is SceneDSL {
  if (!dsl || typeof dsl !== 'object') return false;
  
  // Check camera
  if (!dsl.camera || !Array.isArray(dsl.camera.position) || !Array.isArray(dsl.camera.lookAt)) {
    return false;
  }
  
  // Check lights
  if (!Array.isArray(dsl.lights)) return false;
  
  // Check objects
  if (!Array.isArray(dsl.objects)) return false;
  
  return true;
}

/**
 * Creates a default DSL template
 */
export function createDefaultDSL(): SceneDSL {
  return {
    camera: {
      position: [0, 5, 10],
      lookAt: [0, 0, 0],
      fov: 75
    },
    lights: [
      {
        type: 'ambient',
        color: '#ffffff',
        intensity: 0.5
      },
      {
        type: 'directional',
        color: '#ffffff',
        intensity: 0.8,
        position: [5, 10, 7.5]
      }
    ],
    objects: [],
    background: '#000000'
  };
}
