const fs = require('fs-extra')
const path = require('path')
const git = require('simple-git')(process.cwd())

module.exports = async function({ source, destination }) {
  // if source is a git repo, clone it to src directory
  const gitRepo = source
  source = path.resolve(process.cwd(), destination)
  // set source to src directory so in sourceTheme assignment below, it will be the correct path
  source = destination
  await git.clone(gitRepo, source)
  // remove .git directory
  const remove = ['.git', '.github', '.gitignore', '.vscode']
  remove.forEach(dir => {
    if (fs.existsSync(path.resolve(process.cwd(), source, dir))) fs.removeSync(path.resolve(process.cwd(), source, dir))
  })
  return source
}
