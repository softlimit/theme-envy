<!-- omit in toc -->
# 💚 Theme Envy for Shopify Themes 💚

<!-- omit in toc -->
## _The lean, mean development machine for your Shopify themes_

[![Built by Softlimit](https://cdn.shopify.com/s/files/1/0581/4760/2587/files/softlimit-app-icons-03.png?v=1680017399)](https://www.softlimit.com/)

Theme Envy is a feature-rich, performance-optimized Shopify theme development environment. With the extended liquid tools, you can move beyond liquid snippets with repeatable code. Theme Envy compiles everything for you using a combination of custom build processes, Node, Webpack, and Tailwind.
<!-- omit in toc -->
## Theme Envy Features

- **Get to work**:  
Use [`theme-envy`](#theme-envy-cli) CLI commands to build, serve, initialize, add new feature structure, and much more, without touching your package.json. ⚡ **Bonus**: *Theme Envy's build and watch processes are super fast.* ⚡
- **Stay organized**:  
Put related files together in their own [feature subdirectories](#features) instead of the default Shopify theme structure. You can also add subdirectories within the default Shopify `/snippets` and `/sections` folders to group files.
- **Repeat yourself**:  
Break up code into smaller, reusable pieces with Theme Envy's extended liquid [partials](#partials) and [schema](#schematheme-require) files.
- **Integrate with Ease**:  
Manage app and feature implementation using Theme Envy's [`hooks`](#hooksinstalls) and [`installs`](#hooksinstalls) system.
- **Code in Style**:  
Nest custom styling or apply classes with PostCSS and [Tailwind](#tailwind) built in.
- **Stay Consistent**:  
Customize new feature starter files with your own markup and settings to establish consistency in your theme code base.
- **Customize your Configuration**:  
Add and update values in your `theme.config.js` for direct reference in liquid files using the [`{% theme %}`](#theme) tag
- **Optimize Performance**:  
Automatically lazy-load custom JS elements only when they are present on the page and use [Webpack](#webpack) dynamic imports to conditionally load assets.
- **Build for Production**:  
Automatically prettify liquid and minify javascript on production builds.

---

Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Theme Directory Structure](#theme-directory-structure)
- [CLI](#cli)
- [Build Tools](#build-tools)
  - [Elements](#elements)
  - [Features](#features)
  - [Hooks/installs](#hooksinstalls)
  - [Schema/Theme Require](#schematheme-require)
  - [JS Section Schema](#js-section-schema)
  - [Partials](#partials)
  - [Theme](#theme)
- [Theme.config.js](#themeconfigjs)
- [Tailwind](#tailwind)
- [Webpack](#webpack)
- [Contributing](#contributing)
- [License](#license)
  
## Installation

Use [NPM](https://www.npm.js) to install Theme Envy.

```bash
npm install @softlimit/theme-envy --save-dev
```

## Getting Started
Get started by running the following command and answering the prompts:
```bash
npx theme-envy init
```

> **Note**  
> During the `init` command a new "Feature" is added to your project called `theme-envy` in `src/theme-envy/features/theme-envy`. This feature will add a snippet and `{% render 'theme-envy' %}` to the end of your `<head>` tag in `layout/theme.liquid` during project build. This handles all the Theme Envy JS and CSS.

You are now ready to start developing! Get started with this simple command in your terminal
```bash
npx theme-envy dev
```

## Theme Directory Structure
The directories are [Shopify standard directories](https://shopify.dev/docs/themes/architecture#directory-structure-and-component-types) except for `theme-envy`.
```bash
/
└── assets/
└── config/
└── layout/
└── locales/
└── sections/
└── snippets/
└── templates/
    └── customers/
└── theme-envy/
    └── elements/ # for Custom Elements/Web Components
    └── features/ # individual directories of discrete features
    └── partials/ # small .liquid files that are reusable/inserted across the theme
    └── schema/ # .js files for sharing bits of section/config schema across the theme
```

## CLI
> **Note**  
> Precede all commands with `npx theme-envy`
```
Usage: theme-envy [options] [command]

Theme Envy CLI Tools

Options:
  -h, --help                   display help for command

Commands:
  build [options] [env]        Build Shopify theme
  clean                        Empty output directory
  convert [options] [source]   Convert an existing Shopify theme to Theme Envy directory structure
  dev                          Start development process and sync with Shopify using the Shopify CLI
  init [options] [source]      Initialize a new Shopify theme project with Theme Envy directory structure
  new <type> <name> [include]  Create named directory in theme-envy/features or theme-envy/elements from starter files
  pull-json                    Pull json template, section, and settings_data files from theme using Shopify CLI
  help [command]               display help for command
```

***
## Build Tools

### Elements
Theme Envy is optimized for using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). You can initialize a new Web Component using `utils/starter-element.js` in your project with this command in your terminal:
```bash
npx theme-envy new element <your-element>
```
Your **element** file must have the same name as your new CustomElement (Web Component). Theme Envy will only load the asset(s) for `your-element` if element is present in the DOM.

> **Warning**  
> To take advantage of Theme Envy's smart loading of **elements** they must be inside an `elements` directory

You can also setup an **element** as a subdirectory of `theme-envy/elements` by using an index.js file (`theme-envy/elements/your-element/index.js`). In this case your subdirectory must have the same name as your Web Component.

***
### Features
Theme Envy "Features" are bigger pieces/sections of your site. Any JS/CSS assets associated with a feature will be loaded as part of the main `theme-envy.js` file on all templates in your theme.

> **Note**  
> Features are subdirectories of `src/theme-envy/features`.
  
```bash
/
└── theme-envy/features
   └── your-feature/
      └── config/ # .js files concatenated and added to settings_schema.json
      └── partials/ # .liquid files that are referenced using Theme Envy {% partial 'file-name' %} tag
      └── schema/ # .js files with module.exports to be injected into section files, or referenced with ThemeRequire()
      └── scripts/ # .js files to be imported into index.js
      └── sections/ # .liquid files only, included in build automatically
      └── snippets/ # .liquid files only, included in build automatically
      └── styles/ # contains any .css files, must be imported into index.js
      └── index.js # is concatenated and loaded sitewide
      └── install.js # defines where to inject code into hooks
```

***
### Hooks/installs
Hooks are places in the theme code where *Features* and *Elements* can insert code during build. This allows us to keep integrations discrete and easily undoable. To define a hook in the theme, we only need to add a `hook` tag like so:
```javascript
{% hook 'head-end' %}
```
We can then reference this hook's location with an install.js file in a feature or element.
```javascript
module.exports = [
  {
    hook: 'head-end',
    content: "{% render 'custom-snippet' %}",
    priority: 0-100 // optional, 50 is default
  }
]
```
During the build, all code for the `head-end` hook will be collected, sorted by priority (where 0 is highest in the code), and will replace the `{% hook 'head-end' %}` tag.

***
### Schema/Theme Require
We were frustrated by how difficult it is to share smaller pieces of Shopify Section schema across sections. Theme Envy includes a couple of tools to make this easier.
***
### JS Section Schema
Use this syntax in section `.liquid` files in place of the normal `{% schema %}{% endschema %}` tags:
```javascript
{% schema 'schema-your-section.js' %}
```
> **Note**  
> Don't worry about relative/absolute paths here, Theme Envy will find your uniquely named schema js file within your project.

When managing your section as a **Feature** we recommend putting all of your schema files in that feature's `schema` subdirectory. Schema that is shared across multiple features/sections should go in `src/theme-envy/schema`
> **Warning**
> All **schema** files must be within a `schema`

***
### Partials
By using the syntax 
```javascript 
{% partial '_file-name' %}
```
the contents of the liquid file named `_file-name.liquid` are inserted directly into the output file. Our practice is to name these files with a leading _, but it is not required.
> **Warning**  
> All **partial** files must be within a `partials` directory

***
### Theme
We can use this markup to access properties of the `theme.config.js` file within liquid files. This is especially helpful for when you have to access a breakpoint value within your markup.
```javascript
{% theme 'breakpoints.md' %} // defined in theme.config.js
```

***
## Theme.config.js
After initializing your Theme Envy project, you will find a `theme.config.js` file in your project root. This is where we manage all of the Theme Envy build options.

```javascript
module.exports = {
  entry: {
    // Add entrypoints (Webpack) here
    // main: './src/scripts/main.js',
  },
  store: 'sl-dev-testing.myshopify.com',
  themePath: 'src', // directory for theme source files
  outputPath: 'dist', // directory for build output
  // tailwind: true, // set to false to disable Tailwind
  breakpoints: {
    sm: '640px',
    // => @media (min-width: 640px) { ... }

    md: '768px',
    // => @media (min-width: 768px) { ... }

    lg: '1024px',
    // => @media (min-width: 1024px) { ... }

    xl: '1280px',
    // => @media (min-width: 1280px) { ... }

    '2xl': '1536px'
  // => @media (min-width: 1536px) { ... }
  }
}
```

***
## Tailwind
[Tailwind](https://tailwindcss.com/) is enabled automatically. It can be disabled in `theme.config.js`, and customized in `tailwind.config.js`
***
## Webpack
[Webpack](https://webpack.js.org/) is used to bundle and manage JS and CSS. By default, the only entry point is Theme Envy which will handle all `elements` and `features`. Any additional scripts or stylesheets can be added to the `entry` in `theme.config.js`.

***
## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

***
## License

[MIT](https://choosealicense.com/licenses/mit/)
