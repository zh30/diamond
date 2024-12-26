import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, rmSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import frontMatter from 'front-matter';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Config {
  title: string;
  description: string;
  baseUrl: string;
  theme?: {
    primary: string;
    secondary: string;
  };
}

interface PageAttributes {
  title?: string;
  [key: string]: unknown;
}

interface FrontMatterResult {
  attributes: PageAttributes;
  body: string;
}

const DEFAULT_CONFIG: Config = {
  title: 'Diamond Documentation',
  description: 'Documentation generated with Diamond',
  baseUrl: '/',
  theme: {
    primary: '#3b82f6',
    secondary: '#10b981'
  }
};

export async function build() {
  const cwd = process.cwd();
  
  // Read config file if it exists
  let config = DEFAULT_CONFIG;
  if (existsSync('config.json')) {
    const configContent = readFileSync('config.json', 'utf-8');
    config = { ...DEFAULT_CONFIG, ...JSON.parse(configContent) };
  }

  // Create dist directory if it doesn't exist
  const distDir = join(cwd, 'dist');
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true });
  }
  mkdirSync(distDir, { recursive: true });

  // Find all markdown files
  const files = await glob('**/*.md', {
    ignore: ['node_modules/**', 'dist/**']
  });

  // Create content directory
  const contentDir = join(distDir, 'content');
  mkdirSync(contentDir, { recursive: true });

  // Process each markdown file
  const pages = await Promise.all(
    files.map(async (file) => {
      const content = readFileSync(file, 'utf-8');
      const parsed = frontMatter(content) as FrontMatterResult;
      const html = marked.parse(parsed.body);
      
      if (typeof html !== 'string') {
        throw new Error('Marked failed to generate HTML string');
      }
      
      // Write HTML content to dist/content
      const outputPath = join(contentDir, `${file.replace(/\.md$/, '')}.html`);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, html);

      return {
        path: file.replace(/\.md$/, ''),
        title: parsed.attributes.title || file,
        metadata: parsed.attributes
      };
    })
  );

  // Generate site data
  const siteData = {
    config,
    pages: pages.map(page => ({
      path: page.path,
      title: page.title,
      metadata: page.metadata
    }))
  };

  // Write site data
  writeFileSync(
    join(distDir, 'site-data.json'),
    JSON.stringify(siteData, null, 2)
  );

  // Copy and build template
  await copyTemplate(distDir);
}

async function copyTemplate(distDir: string) {
  const cwd = process.cwd();
  const templateDir = join(__dirname, '../../template');
  const templateBuildDir = join(templateDir, 'dist');
  const tempDir = join(cwd, '.temp_build');

  // Build the template
  process.chdir(templateDir);
  execSync('pnpm install', { stdio: 'inherit' });
  execSync('pnpm build', { stdio: 'inherit' });

  // Create a temporary directory for the build
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
  }
  mkdirSync(tempDir, { recursive: true });

  // Copy the built template files
  const files = readFileSync(join(templateBuildDir, 'index.html'), 'utf-8');
  writeFileSync(join(tempDir, 'index.html'), files);

  // Copy assets
  const assetsDir = join(templateBuildDir, 'assets');
  if (existsSync(assetsDir)) {
    cpSync(assetsDir, join(tempDir, 'assets'), { recursive: true });
  }

  // Copy content and site data from the original dist directory
  cpSync(join(distDir, 'content'), join(tempDir, 'content'), { recursive: true });
  cpSync(join(distDir, 'site-data.json'), join(tempDir, 'site-data.json'));

  // Clean up the original dist directory
  rmSync(distDir, { recursive: true });

  // Move the temp directory to dist
  renameSync(tempDir, distDir);

  // Return to the original directory
  process.chdir(cwd);
} 