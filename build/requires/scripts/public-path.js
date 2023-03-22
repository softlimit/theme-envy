/**
 * @file Sets the public path for Webpack to use in dynamic imports
 * @see https://webpack.js.org/guides/public-path/#on-the-fly
 */

/* eslint-disable no-undef */
/* eslint-disable camelcase */
// window.ThemeEnvy.publicPath is set in the theme-envy.liquid snippet
__webpack_public_path__ = window.ThemeEnvy.publicPath
