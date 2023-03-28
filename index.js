#!/usr/bin/env node
/**
 * @file Theme Envy CLI
 * @description Theme Envy CLI Tools
 * @example npx theme-envy
 */

const chalk = require('chalk')
const commander = require('commander')
const emoji = require('node-emoji')
const fs = require('fs-extra')
const program = new commander.Command()
const promptly = require('promptly')

const { directories } = require('#EnsureDirectories')
require('#Helpers/functions/global-theme-envy.js')

const themeEnvyCommands = {
  build: require('#Build'),
  clean: require('#Helpers/functions/dist-clean.js'),
  convert: require('#Convert'),
  dev: require('#Helpers/functions/dev.js'),
  init: require('#Init'),
  new: require('#Helpers/functions/scaffold-new/index.js'),
  orphans: require('#Helpers/functions/find-orphans.js'),
  'pull-json': require('#Helpers/functions/pull-json.js'),
  tree: require('#Helpers/functions/liquid-tree/index.js'),
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
  .description('Build Shopify theme')
  .usage('[development|production] -w|--watch')
  .addArgument(new commander.Argument('[env]', 'Specify the build environment to run').choices(['development', 'production']))
  .option('-w, --watch', 'Watch for changed files and update dist, serve with Shopify CLI')
  .option('-v, --verbose', 'Show Tailwind and Webpack in output')
  .action((env, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.build(env, options)
  })

program
  .command('clean')
  .description('Empty output directory')
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
  .command('find-orphans')
  .description('Find unused snippets, partials, and assets in your Shopify theme')
  .action((options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.orphans()
  })

program
  .command('init')
  .description('Initialize a new Shopify theme project with Theme Envy directory structure')
  .usage('[source] -e|--example -c|--convert')
  .argument('[source]', 'Specify the path/git url to your theme source directory to process, if not provided will create the directory structure in /src')
  .option('-s, --store <store>', 'Specify the myshopify domain for your store', 'my-store.myshopify.com')
  .option('-c, --convert', 'Convert theme sections to features, add hooks, and install theme-envy feature on import')
  .option('-e, --example', 'Output example feature structure and dummy files with readme documentation in each subdirectory')
  .action(async (source, options, command) => {
    scriptMessage(command.name())
    if (!source) {
      let choice = await promptly.choose(`${chalk.yellow('Would you like to:')}
  a) Import an existing repo from a .git url
  b) Initialize from a Shopify theme in the current directory, or initialize empty directories if no Shopify theme exists?

(a/b)?`, ['a', 'b', 'A', 'B'])
      choice = choice.toLowerCase()
      if (choice === 'a') {
        const gitUrl = await promptly.prompt(chalk.yellow('Please provide the git url for your source theme:\n'), {
          validator(value) {
            if (value.includes('git@') || value.includes('https://')) return value
            throw new Error(chalk.red.bold('Please enter a valid git url'))
          }
        })
        if (gitUrl) {
          source = gitUrl
        }
      }
    }
    // check for existing Shopify theme in root
    const rootDirs = fs.readdirSync(process.cwd()).filter(res => !res.includes('.'))
    const shopifyThemeExistsInRoot = directories.every(dir => rootDirs.includes(dir))
    if (!options.convert && (shopifyThemeExistsInRoot || source)) {
      const convert = await promptly.confirm(`
${chalk.yellow('Do you want to convert the existing theme and install Theme Envy?')} ${chalk.green('(recommended)')}
This does the following things:
  • Converts your theme sections to Theme Envy features (where possible)
  • Adds ${chalk.cyan('{% hook %}')} tags to ${chalk.cyan('theme.liquid')}
  • Installs the Theme Envy integration feature to ${chalk.cyan('theme-envy/features')}
(Y/n)`)
      if (convert) {
        options.convert = true
      }
    }
    if (!options.example) {
      const example = await promptly.confirm(`${chalk.yellow('Would you like to output an example Theme Envy "Feature"?')}\n(Y/n)?`)
      if (example) {
        options.example = true
      }
    }
    if (options.store === 'my-store.myshopify.com') {
      options.store = await promptly.prompt(chalk.yellow('Please provide the myshopify.com domain of your store (this can be changed later in theme.config.js):\n '))
    }
    themeEnvyCommands.init(source, options)
  })

program
  .command('new')
  .description('Create new Feature or Element from starter files')
  .usage('<type> <name> [include]')
  .addArgument(new commander.Argument('<type>', 'Define the type of scaffold to create').choices(['feature', 'element']))
  .argument('<name>', 'Handleized name for the new element|feature')
  .argument('[include]', 'Comma-separated list of starter directories and files to include in your scaffold. Defaults to all if not provided. all,config,install,sections,snippets,schema,styles')
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

program
  .command('tree')
  .description('Display the dependency tree for a .liquid file')
  .usage('[filepaths]')
  .argument('[filepaths]', 'Project relative path(s) to .liquid files. Separate multiple paths with commas.')
  .option('-v, --verbose', 'display as JS Object instead of formatted tree')
  .action((filepath, options, command) => {
    scriptMessage(command.name())
    themeEnvyCommands.tree(filepath, options)
  })
program.parse()
