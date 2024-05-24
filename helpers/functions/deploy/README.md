# CI/CD with Github Workflow

During the `init` command, Theme Envy copies a `deploy.yml` workflow file into your project. This file is used to build and deploy your project to Github Pages.

## Variable and Secret Requirements

This workflow requires one environment secret to be set in your Github repository settings.

First, set up a 'production' environment for this workflow to run in.

Next, install Theme Access in your store and create a new theme access token.

Save this access token as an environment secret called `SHOPIFY_CLI_THEME_TOKEN`.

## Triggering the workflow

The deploy workflow is triggered by any added tag that starts with `v`. This is usually done when you create a new release.

For testing purposes, it will also run on any push to a branch named `deploy-release-action`.
