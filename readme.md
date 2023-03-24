Theme Envy is a Shopify development environment optimized for performance using Node, Webpack, Tailwind, and custom build processes for repeatable code beyond liquid snippets.

What you can do with Theme Envy
* Easily share schema across sections and theme settings
* Tailwind, Webpack, out of the box
* Manage section schema with Javascript files `{% schema 'schema-section.js' %}`
* Use subdirectories in `/snippets`, `/sections`, etc.
* Manage app and feature integrations using our `hooks` and `installs` system.
* Directly reference breakpoints and other values in `theme.config.js` from your liquid files eg: `{% theme 'breakpoints.md' %}`
* Share code around your theme using `partials`, even within `{% liquid %}` tags. Theme Envy replaces the `{% partial '_example-file' %}` with the code from the referenced file.
* Set starter content for new features and elements to establish consistency in your code base.
* Manage all code for discrete features in their own subdirectories.
* Import an existing Shopify theme
* Automatically load Web Components/HTML Custom Elements only when they are in the DOM
* Super fast build and watch times

Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Theme Directory Structure](#theme-directory-structure)
- [Theme Envy CLI](#theme-envy-cli)
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
You can get started one of three ways:
* `npx theme-envy init` in an empty directory will give you the directory structure for Theme Envy.
* `npx theme-envy init https://github.com/Organization/repo.git --convert` imports an existing theme from Github and sets up Theme Envy
* By running `npx theme-envy init` in an existing Shopify theme directory

To get started with an existing theme, we can use Shopify's [Dawn](https://github.com/Shopify/dawn) as an example, but you can also specify a local path.
```bash
# Imports Dawn, and with the --convert flag: 
# Adds Theme Envy directories
# Adds Theme Envy install hooks to layout/theme.liquid
# Parses existing sections and creates Theme Envy "features" when possible
npx theme-envy init https://github.com/Shopify/dawn.git --convert
```
Edit the new `theme.config.js` in your project root with your store's myshopify domain
```javascript
module.exports = {
  ...
  store: 'your-shop.myshopify.com',
  ...
}
```

> During the `init` command a new "Feature" is added to your project called `theme-envy` in `src/_features/theme-envy`. This feature will add a snippet and `{% render 'theme-envy' %}` to the end of your `<head>` tag in `layout/theme.liquid` during project build. This handles all the Theme Envy JS and CSS.

You are now ready to start developing! Get started with this simple command in your terminal
```bash
npx theme-envy dev
```

## Theme Directory Structure
Theme Envy directories are prefixed with `_`.
The other directories are the [Shopify standard directories](https://shopify.dev/docs/themes/architecture#directory-structure-and-component-types).
```bash
/
└── _elements/ # for Custom Elements/Web Components
└── _features/ # individual directories of discrete features
└── _partials/ # small .liquid files that are reusable/inserted across the theme
└── _schema/ # .js files for sharing bits of section/config schema across the theme
└── assets/
└── config/
└── layout/
└── locales/
└── sections/
└── snippets/
└── templates/
    └── customers/
```

## Theme Envy CLI
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
  new <type> <name> [include]  Create named directory in _features or _elements with starter files to build new feature|element
  pull-json                    Pull json template, section, and settings_data files from theme using Shopify CLI
  help [command]               display help for command
```

## Build Tools

### Elements
Theme Envy is optimized for using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). You can initialize a new Web Component using `utils/starter-element.js` in your project with this command in your terminal:
```bash
npx theme-envy new element <your-element>
```
Your **element** file must have the same name as your new CustomElement (Web Component). Theme Envy will only load the asset(s) for `your-element` if element is present in the DOM.

> To take advantage of Theme Envy's smart loading of **elements** they must be inside the `_elements` directory

You can also setup an **element** as a subdirectory of `_elements` by using an index.js file (`_elements/your-element/index.js`). In this case your subdirectory must have the same name as your Web Component.

### Features
Theme Envy "Features" are bigger pieces/sections of your site. Any JS/CSS assets associated with a feature will be loaded as part of the main `theme-envy.js` file on all templates in your theme.

> Features are subdirectories of `src/_features`.
  
```bash
/
└── _features
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

### Hooks/installs
Hooks are places in our theme code where *Features* and *Elements* can insert code during build. This allows us to keep integrations discrete and easily undoable. To define a hook in the theme, we only need to add a `hook` tag like so:
```javascript
{% hook 'head-end' %}
```
We can then reference this spot in our theme code with an install.js file in a feature or element.
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

### Schema/Theme Require
We were frustrated by how difficult it is to share smaller pieces of Shopify Section schema across sections. Theme Envy includes a couple of tools to make this easier.
#### JS Section Schema
Use this syntax in section `.liquid` files in place of the normal `{% schema %}{% endschema %}` tags:
```javascript
{% schema 'schema-your-section.js' %}
```
> Don't worry about relative/absolute paths here, Theme Envy will find your uniquely named schema js file within your project.

When managing your section as a **Feature** we recommend putting all of your schema files in that feature's `schema` subdirectory. Schema that is shared across multiple features/sections should go in `src/_schema`
> All **schema** files must be within a `schema` or `_schema` directory

### Partials
By using the syntax 
```javascript 
{% partial '_file-name' %}
```
the contents of the liquid file named `_file-name.liquid` are inserted directly into the output file. Our practice is to name these files with a leading _, but it is not required.
> All **partial** files must be within a `partials` or `_partials` directory

### Theme
We can use this markup to access properties of our `theme.config.js` file within liquid files. This is especially helpful for when you have to access a breakpoint value within your markup.
```javascript
{% theme 'breakpoints.md' %} // defined in theme.config.js
```

## Theme.config.js
After initializing your Theme Envy project, you will find a `theme.config.js` file in your project root. This is where we manage all of our Theme Envy build options.

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

## Tailwind
[Tailwind](https://tailwindcss.com/) is enabled automatically. It can be disabled in `theme.config.js`, and customized in `tailwind.config.js`
## Webpack
[Webpack](https://webpack.js.org/) is used to bundle and manage JS and CSS. By default, the only entry point is Theme Envy which will handle all `elements` and `features`. Any additional scripts or stylesheets can be added to the `entry` in `theme.config.js`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)