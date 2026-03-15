/**
 * @webmcpregistry/cli — WebMCP readiness testing tool.
 *
 * Usage:
 *   npx @webmcpregistry/cli test https://yoursite.com
 *   npx @webmcpregistry/cli scan https://yoursite.com
 *   npx @webmcpregistry/cli init
 */

import { Command } from 'commander'
import { testCommand } from './commands/test.js'
import { scanCommand } from './commands/scan.js'
import { initCommand } from './commands/init.js'

const program = new Command()

program
  .name('webmcp')
  .description('Test and validate WebMCP readiness of any website')
  .version('0.2.0')

program
  .command('test <url>')
  .description('Run a full WebMCP readiness test on a URL (requires Playwright)')
  .option('-o, --output <format>', 'Output format: terminal, json, badge', 'terminal')
  .option('--no-security', 'Skip security checks')
  .option('--no-color', 'Disable color output')
  .action(testCommand)

program
  .command('scan <url>')
  .description('Lightweight static scan (no browser needed)')
  .option('-o, --output <format>', 'Output format: terminal, json', 'terminal')
  .action(scanCommand)

program
  .command('init')
  .description('Scaffold WebMCP setup for your project')
  .option('--framework <name>', 'Framework: react, nextjs, vue, angular, svelte, html', 'html')
  .action(initCommand)

program.parse()
