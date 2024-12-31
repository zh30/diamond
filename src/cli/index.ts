import { Command } from 'commander';
import { build } from '@/parser/build';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取包信息
let version = '0.0.1';
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
  version = pkg.version;
} catch (error) {
  // 如果无法读取 package.json，使用默认版本
  console.warn('Warning: Could not read package.json, using default version');
}

const program = new Command();

program
  .name('@zhanghe/diamond')
  .description('An Obsidian document parser and static site generator')
  .version(version);

program
  .command('build')
  .description('Build static site from Obsidian documents')
  .action(async () => {
    try {
      await build();
      console.log('✨ Static site generated successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error building site:', error);
      process.exit(1);
    }
  });

program.parse();
