import 'dotenv/config';
import { OpenAIService } from './openaiService.js';
import { SceneGenerator } from './sceneGenerator.js';
import { createDefaultDSL } from './types/dsl.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Demo script with multiple examples
 */
async function demo() {
  console.log('🎬 Three.js AI Scene Generator - Demo\n');
  console.log('=' .repeat(50));

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.log('Please create a .env file with your OpenAI API key:');
    console.log('OPENAI_API_KEY=your_key_here\n');
    process.exit(1);
  }

  const aiService = new OpenAIService();
  const sceneGenerator = new SceneGenerator();

  // Create output directory
  const outputDir = './output';
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    // Directory already exists
  }

  // Demo prompts
  const demos = [
    {
      name: 'Simple Scene',
      prompt: 'Create a red cube on a white plane with ambient lighting'
    },
    {
      name: 'Solar System',
      prompt: 'Create a simple solar system with a yellow sun sphere in the center, a small blue Earth sphere orbiting it, and a gray moon. Add dramatic lighting.'
    },
    {
      name: 'Abstract Art',
      prompt: 'Create an abstract composition with multiple colorful geometric shapes (cubes, spheres, torus) arranged artistically in 3D space with vibrant colors'
    }
  ];

  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i];
    console.log(`\n📝 Demo ${i + 1}: ${demo.name}`);
    console.log(`Prompt: "${demo.prompt}"`);
    console.log('-'.repeat(50));

    try {
      console.log('🤖 Generating DSL...');
      const dsl = await aiService.generateDSL(demo.prompt);
      
      console.log(`✅ Generated ${dsl.objects.length} objects, ${dsl.lights.length} lights`);

      // Generate HTML
      const html = sceneGenerator.generateHTML(dsl, demo.name);
      const filename = `demo-${i + 1}-${demo.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      const filepath = join(outputDir, filename);
      
      writeFileSync(filepath, html);
      console.log(`💾 Saved to: ${filepath}`);

      // Small delay to avoid rate limiting
      if (i < demos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Error in demo ${i + 1}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Demo complete!');
  console.log(`\n💡 Open the HTML files in ${outputDir}/ to view the scenes!`);
}

// Run demo
demo();
