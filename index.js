#!/usr/bin/env node
/**
 * @file Theme Envy CLI
 * @description Theme Envy CLI Tools
 * @example npx theme-envy
 */

const commander = require('commander')
const program = new commander.Command()
const chalk = require('chalk')
const emoji = require('node-emoji')
require('#Helpers/functions/global-theme-envy.js')

const themeEnvyCommands = {
  build: require('#Build'),
  clean: require('#Helpers/functions/dist-clean.js'),
  convert: require('#Convert'),
  dev: require('#Helpers/functions/dev.js'),
  init: require('#Init'),
  new: require('#Helpers/functions/scaffold-new/index.js'),
  'pull-json': require('#Helpers/functions/pull-json.js'),
}

const scriptMessage = (scriptName) => {
  console.log(`\n ${emoji.get('rocket')} Shopify Theme Envy ${chalk.green.bgBlack.bold(`\n    theme-envy ${scriptName}\n`)}`)
}

program
  .description('Theme Envy CLI Tools')
  .addHelpText('beforeAll', `
${emoji.get('green_heart') + chalk.green.bold(' Softlimit Shopify Theme Envy ') + emoji.get('green_heart')}
${chalk.green.bold('===================================')}
  `)
  .addHelpText('afterAll', `
${chalk.cyan.bold('===================================')}
${emoji.get('thinking_face')} ${chalk.cyan.bold.underline('Need more help?')}
We are always looking for ways to improve our tools
and make your Shopify development life smoother.

  Let us know what we missed! Create an issue on our github repo:
  ${chalk.dim.underline('https://github.com/softlimit/shopify-env/issues')}
  `)

program
  .command('build')
  .description('Build Shopify theme dist from src in either production or development context with watch process option for serving')
  .usage('[development|production] -w|--watch')
  .addArgument(new commander.Argument('[env]', 'Specify the build environment to run').choices(['development', 'production']))
  .option('-w, --watch', 'Watch for changed files and update dist')
  .option('-v, --verbose', 'Show Tailwind and Webpack in output')
  .action((env, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.build(env, options)
  })

program
  .command('clean')
  .description('Clear dist folder contents')
  .action((options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.clean()
  })

program
  .command('convert')
  .description('Convert an existing Shopify theme to Theme Envy directory structure')
  .usage('[source] -a|--add-theme-envy-feature')
  .argument('[source]', 'Specify the path to your theme source directory to process, defaults to project root ./src directory if not provided')
  .option('-a, --add-theme-envy-feature', 'Add theme-envy feature and install to hook')
  .action((source, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.convert(source)
  })

program
  .command('dev')
  .description('Start development process and sync with Shopify using the Shopify CLI')
  .action((options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.dev()
  })

program
  .command('init')
  .description('Initialize a new Shopify theme project with Theme Envy directory structure')
  .usage('[source] -e|--example -c|--convert')
  .argument('[source]', 'Specify the path/git url to your theme source directory to process, if not provided will create the directory structure in /src')
  .option('-c, --convert', 'Convert theme sections to _features, add hooks, and install theme-envy feature on import')
  .option('-e, --example', 'Output example feature structure and dummy files with readme documentation in each subdirectory')
  .action((source, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.init(source, options)
  })

program
  .command('new')
  .description('Create new Feature (_features) or Element (_elements) from starter files')
  .usage('<type> <name> [include]')
  .addArgument(new commander.Argument('<type>', 'Define the type of scaffold to create').choices(['feature', 'element']))
  .argument('<name>', 'Handleized name for the new element|feature')
  .argument('[include]', 'Comma-separated list of starter directories and files to include in your scaffold. Defaults to all if not provided. all|config|install|sections|snippets|schema|styles')
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
  .action((options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands['pull-json']()
  })

program.parse()
