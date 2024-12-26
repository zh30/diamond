#!/usr/bin/env node

import { Command } from 'commander';
import { build } from '../parser/build.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

const program = new Command();

program
  .name('@zhanghe/diamond')
  .description('An Obsidian document parser and static site generator')
  .version(pkg.version);

program
  .command('build')
  .description('Build static site from Obsidian documents')
  .action(async () => {
    try {
      await build();
      console.log('✨ Static site generated successfully!');
    } catch (error) {
      console.error('Error building site:', error);
      process.exit(1);
    }
  });

program.parse();
