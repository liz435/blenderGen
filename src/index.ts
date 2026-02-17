import 'dotenv/config';
import { OpenAIService } from './openaiService.js';
import { SceneGenerator } from './sceneGenerator.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Main entry point - demonstrates the pipeline
 */
async function main() {
  console.log('🚀 Three.js AI Scene Generator\n');

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.log('Please create a .env file with your OpenAI API key:');
    console.log('OPENAI_API_KEY=your_key_here\n');
    process.exit(1);
  }

  // Initialize services
  const aiService = new OpenAIService();
  const sceneGenerator = new SceneGenerator();

  // Example prompt
  const prompt = process.argv[2] || 
    'Create a scene with a red cube, a blue sphere, and a green plane as ground. Add proper lighting.';

  console.log(`📝 Prompt: ${prompt}\n`);
  console.log('🤖 Generating DSL from OpenAI...');

  try {
    // Generate DSL from prompt
    const dsl = await aiService.generateDSL(prompt);
    console.log('✅ DSL generated successfully!\n');
    console.log('Generated DSL:');
    console.log(JSON.stringify(dsl, null, 2));
    console.log('');

    // Generate Three.js code
    console.log('🎨 Generating Three.js scene code...');
    const sceneCode = sceneGenerator.generateScene(dsl);
    
    // Generate HTML file
    const html = sceneGenerator.generateHTML(dsl, 'AI Generated Scene');
    
    // Save outputs
    const outputDir = './output';
    const dslPath = join(outputDir, 'scene-dsl.json');
    const codePath = join(outputDir, 'scene.js');
    const htmlPath = join(outputDir, 'scene.html');

    try {
      writeFileSync(dslPath, JSON.stringify(dsl, null, 2));
      writeFileSync(codePath, sceneCode);
      writeFileSync(htmlPath, html);
      
      console.log('✅ Scene generated successfully!\n');
      console.log('Output files:');
      console.log(`  - DSL: ${dslPath}`);
      console.log(`  - Code: ${codePath}`);
      console.log(`  - HTML: ${htmlPath}`);
      console.log('\n💡 Open scene.html in a browser to view the 3D scene!');
    } catch (err) {
      console.error('Error saving files:', err);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the main function
main();
