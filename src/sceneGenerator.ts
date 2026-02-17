import { SceneDSL, ObjectConfig, LightConfig } from './types/dsl.js';

/**
 * Generates Three.js scene code from DSL
 */
export class SceneGenerator {
  /**
   * Generate complete Three.js scene code
   */
  generateScene(dsl: SceneDSL): string {
    const imports = this.generateImports();
    const sceneSetup = this.generateSceneSetup(dsl);
    const camera = this.generateCamera(dsl);
    const lights = this.generateLights(dsl);
    const objects = this.generateObjects(dsl);
    const renderer = this.generateRenderer(dsl);
    const animate = this.generateAnimateFunction();

    return `${imports}

${sceneSetup}

${camera}

${lights}

${objects}

${renderer}

${animate}`;
  }

  /**
   * Generate ES6 imports
   */
  private generateImports(): string {
    return `import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';`;
  }

  /**
   * Generate scene setup code
   */
  private generateSceneSetup(dsl: SceneDSL): string {
    return `// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('${dsl.background || '#000000'}');`;
  }

  /**
   * Generate camera code
   */
  private generateCamera(dsl: SceneDSL): string {
    const { position, lookAt, fov = 75 } = dsl.camera;
    
    return `// Create camera
const camera = new THREE.PerspectiveCamera(
  ${fov},
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(${position.join(', ')});
camera.lookAt(${lookAt.join(', ')});`;
  }

  /**
   * Generate lights code
   */
  private generateLights(dsl: SceneDSL): string {
    const lightsCode = dsl.lights.map((light, index) => 
      this.generateLight(light, index)
    ).join('\n\n');
    
    return `// Add lights\n${lightsCode}`;
  }

  /**
   * Generate a single light
   */
  private generateLight(light: LightConfig, index: number): string {
    const varName = `${light.type}Light${index}`;
    
    switch (light.type) {
      case 'ambient':
        return `const ${varName} = new THREE.AmbientLight('${light.color}', ${light.intensity});
scene.add(${varName});`;
      
      case 'directional':
        const dirPos = light.position || [5, 10, 7.5];
        return `const ${varName} = new THREE.DirectionalLight('${light.color}', ${light.intensity});
${varName}.position.set(${dirPos.join(', ')});
scene.add(${varName});`;
      
      case 'point':
        const pointPos = light.position || [0, 5, 0];
        return `const ${varName} = new THREE.PointLight('${light.color}', ${light.intensity});
${varName}.position.set(${pointPos.join(', ')});
scene.add(${varName});`;
      
      case 'spot':
        const spotPos = light.position || [0, 10, 0];
        return `const ${varName} = new THREE.SpotLight('${light.color}', ${light.intensity});
${varName}.position.set(${spotPos.join(', ')});
scene.add(${varName});`;
      
      default:
        return '';
    }
  }

  /**
   * Generate objects code
   */
  private generateObjects(dsl: SceneDSL): string {
    const objectsCode = dsl.objects.map((obj, index) => 
      this.generateObject(obj, index)
    ).join('\n\n');
    
    return `// Add objects\n${objectsCode}`;
  }

  /**
   * Generate a single object
   */
  private generateObject(obj: ObjectConfig, index: number): string {
    const geometry = this.generateGeometry(obj);
    const material = this.generateMaterial(obj);
    const varName = `mesh${index}`;
    
    const rotation = obj.rotation || [0, 0, 0];
    const scale = obj.scale || [1, 1, 1];
    
    return `const geometry${index} = ${geometry};
const material${index} = ${material};
const ${varName} = new THREE.Mesh(geometry${index}, material${index});
${varName}.position.set(${obj.position.join(', ')});
${varName}.rotation.set(${rotation.join(', ')});
${varName}.scale.set(${scale.join(', ')});
scene.add(${varName});`;
  }

  /**
   * Generate geometry code
   */
  private generateGeometry(obj: ObjectConfig): string {
    switch (obj.type) {
      case 'cube':
        const w = obj.width || 1;
        const h = obj.height || 1;
        const d = obj.depth || 1;
        return `new THREE.BoxGeometry(${w}, ${h}, ${d})`;
      
      case 'sphere':
        const r = obj.radius || 1;
        const seg = obj.segments || 32;
        return `new THREE.SphereGeometry(${r}, ${seg}, ${seg})`;
      
      case 'plane':
        const pw = obj.width || 10;
        const ph = obj.height || 10;
        return `new THREE.PlaneGeometry(${pw}, ${ph})`;
      
      case 'cylinder':
        const cr = obj.radius || 1;
        const ch = obj.height || 2;
        return `new THREE.CylinderGeometry(${cr}, ${cr}, ${ch}, 32)`;
      
      case 'cone':
        const coneR = obj.radius || 1;
        const coneH = obj.height || 2;
        return `new THREE.ConeGeometry(${coneR}, ${coneH}, 32)`;
      
      case 'torus':
        const torusR = obj.radius || 1;
        return `new THREE.TorusGeometry(${torusR}, ${torusR * 0.4}, 16, 100)`;
      
      default:
        return `new THREE.BoxGeometry(1, 1, 1)`;
    }
  }

  /**
   * Generate material code
   */
  private generateMaterial(obj: ObjectConfig): string {
    const { material } = obj;
    
    const params: string[] = [`color: '${material.color}'`];
    
    if (material.metalness !== undefined) {
      params.push(`metalness: ${material.metalness}`);
    }
    if (material.roughness !== undefined) {
      params.push(`roughness: ${material.roughness}`);
    }
    if (material.wireframe) {
      params.push(`wireframe: ${material.wireframe}`);
    }
    
    switch (material.type) {
      case 'basic':
        return `new THREE.MeshBasicMaterial({ ${params.join(', ')} })`;
      case 'standard':
        return `new THREE.MeshStandardMaterial({ ${params.join(', ')} })`;
      case 'phong':
        return `new THREE.MeshPhongMaterial({ ${params.join(', ')} })`;
      case 'lambert':
        return `new THREE.MeshLambertMaterial({ ${params.join(', ')} })`;
      default:
        return `new THREE.MeshStandardMaterial({ ${params.join(', ')} })`;
    }
  }

  /**
   * Generate renderer code
   */
  private generateRenderer(dsl: SceneDSL): string {
    return `// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`;
  }

  /**
   * Generate animation loop
   */
  private generateAnimateFunction(): string {
    return `// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();`;
  }

  /**
   * Generate HTML file with embedded scene code
   */
  generateHTML(dsl: SceneDSL, title: string = 'Three.js Scene'): string {
    const sceneCode = this.generateScene(dsl);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    #info {
      position: absolute;
      top: 10px;
      left: 10px;
      color: white;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px;
      border-radius: 5px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="info">
    <strong>${title}</strong><br>
    Left click + drag to rotate<br>
    Right click + drag to pan<br>
    Scroll to zoom
  </div>
  
  <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
        "three/examples/jsm/controls/OrbitControls.js": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"
      }
    }
  </script>
  
  <script type="module">
${sceneCode}
  </script>
</body>
</html>`;
  }
}
