/**
 * @file Helper function to import a git repo into the src directory
 * @param {object} options - options object
 * @param {string} options.source - git repo url
 * @param {string} options.dest - destination directory
 * @returns {string} - destination directory
 */

const fs = require('fs-extra')
const path = require('path')
const git = require('simple-git')(process.cwd())

module.exports = async function({ source, dest }) {
  await git.clone(source, dest)
  // remove .git directory
  const remove = ['.git', '.github', '.gitignore', '.vscode']
  remove.forEach(dir => {
    if (fs.existsSync(path.resolve(process.cwd(), dest, dir))) fs.removeSync(path.resolve(process.cwd(), dest, dir))
  })
  return dest
}
