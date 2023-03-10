#!/usr/bin/env node

const commander = require('commander')
const program = new commander.Command()
const chalk = require('chalk')
const themeEnvyCommands = require('#Root/theme-envy-commands.js')

const scriptMessage = (scriptName) => {
  console.log(
    chalk.green.bold('Starting Softlimit Theme Envy script'),
    chalk.bgGreen(`theme-envy ${scriptName}\n`)
  )
}

program
  .description('Theme Envy CLI Tools')
  .addHelpText('beforeAll', `
${chalk.green.bold('Welcome to Shopify Theme Envy <3')}
  `)

program
  .command('build')
  .description('Build Shopify theme dist from src in either production or development context with watch process option for serving')
  .usage('npx theme-envy development|production -w|--watch')
  .addArgument(new commander.Argument('[env]', 'Specify the build environment to run').choices(['development', 'production']))
  .option('-w, --watch', 'Watch for changed files and update dist')
  .action((env, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.build(env, options)
  })

program
  .command('clean')
  .description('Clear dist folder contents')
  .usage('npx theme-envy clean')
  .action((command) => {
    scriptMessage(command.name())
    themeEnvyCommands.clean()
  })

program
  .command('convert')
  .description('Convert an existing Shopify theme to Theme Envy directory structure')
  .usage('npx theme-envy convert [source]')
  .argument('[source]', 'Specify the path to your theme source directory to process, defaults to project root ./src directory if not provided')
  .action((source, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.convert(source)
  })

program
  .command('dev')
  .description('Start development process and sync with Shopify using the Shopify CLI')
  .action((command) => {
    scriptMessage(command.name())
    themeEnvyCommands.dev()
  })

program
  .command('ignore')
  .action((command) => {
    scriptMessage(command.name())
    themeEnvyCommands.ignore()
  })

program
  .command('import')
  .description('Import an existing Shopify theme into a destination directory (default: "./src")')
  .usage('npx theme-envy import [source]')
  .argument('[source]', 'Specify the path to your theme source directory to process, defaults to project root ./src directory if not provided')
  .option('-c, --convert', 'Convert theme sections to _features, add hooks, and install theme-envy feature on import')
  .action((source, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.import(source, options)
  })

program
  .command('init')
  .description('Create skeleton structure for src folder into a destination directory (default: project root "./")')
  .usage('npx theme-envy init [source] -e|--example')
  .argument('[source]', 'Path to target directory to init shopify theme envy files in, defaults to current user directory')
  .option('-e, --example', 'Output example feature structure and dummy files with readme documentation in each subdirectory')
  .action((source, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.init(source, options)
  })

program
  .command('new')
  .description('Create named directory in _features or _elements with starter files to build new feature|element')
  .usage('npx theme-envy <type> <name> [include]')
  .addArgument(new commander.Argument('<type>', 'Define the type of scaffold to create').choices(['feature', 'element']))
  .argument('<name>', 'Handleized name for the new element|feature')
  .argument('[include]', 'Comma-separated list of starter directories and files to include in your scaffold. Defaults to all if not provided.')
  .action((type, name, include, options, command) => {
    scriptMessage(command.name())
    if (name.includes(',') || name.includes(' ')) {
      console.error(
        chalk.red('Invalid Name:'),
        'Name argument should only include text and dashes, no commas or spaces. Rename with handle version to continue.'
      )
      return
    }
    themeEnvyCommands.new(type, name, include)
  })

program
  .command('pull-json')
  .description('Pull json template, section, and settings_data files from theme using Shopify CLI')
  .action((command) => {
    scriptMessage(command.name())
    themeEnvyCommands['pull-json']()
  })

program.parse()
