/*
* Based on https: //betterprogramming.pub/create-your-own-changelog-generator-with-git-aefda291ea93
*/

const path = require('path')
const fs = require('fs')
const child = require('child_process')

module.exports = function() {
  const latestTag = child.execSync('git describe --long').toString('utf-8').split('-')[0]
  const output = child
    .execSync(`git log ${latestTag}..HEAD --format=%B%H----DELIMITER----`)
    .toString('utf-8')

  const commitsArray = output
    .split('----DELIMITER----\n')
    .map(commit => {
      const commitParts = commit.split('\n')
      const { 0: message, [commitParts.length - 1]: sha, ...body } = commitParts

      return {
        sha,
        message,
        body
      }
    })
    .filter(commit => Boolean(commit.sha))

  const currentChangelog = fs.readFileSync('./CHANGELOG.md', 'utf-8')
  const currentVersion = require(path.resolve(process.cwd(), './package.json')).version
  let newChangelog = `# Version ${currentVersion} (${
    new Date().toISOString().split('T')[0]
  })\n\n`

  const features = {
    name: 'Features',
    commits: commitTypeMsgArray(commitsArray, 'feat')
  }
  const performance = {
    name: 'Performance',
    commits: commitTypeMsgArray(commitsArray, 'perf: ')
  }
  const styles = {
    name: 'Styling',
    commits: commitTypeMsgArray(commitsArray, 'style: ')
  }
  const chores = {
    name: 'Chores',
    commits: commitTypeMsgArray(commitsArray, 'chore: ')
  }
  const fixes = {
    name: 'Bugfixes',
    commits: commitTypeMsgArray(commitsArray, 'fix')
  }
  const merges = {
    name: 'Branch merges',
    commits: commitTypeMsgArray(commitsArray, 'Merged ')
  }
  const miscCommits = {
    name: 'Other updates',
    commits: commitTypeMsgArray(commitsArray, '')
  }

  // combine the lists to iterate through and add to the new changelog
  const commitLists = [features, fixes, styles, performance, chores, miscCommits]

  let changelogEntries = ''
  commitLists.forEach(list => {
    if (list.commits.length === 0) return
    changelogEntries += addListToChangelog(list.commits, list.name)
  })
  newChangelog += changelogEntries

  // prepend the newChangelog to the current one
  fs.writeFileSync('./CHANGELOG.md', `${newChangelog}${currentChangelog}`)
}

function commitTypeMsgArray(commitsArray, type) {
  // support blank string type argument for commits that don't start with any of our normal delimiters
  let array = []
  if (type === '') {
    array = commitsArray
      .filter(commit => !commit.message.startsWith('feat') && !commit.message.startsWith('chore: ') && !commit.message.startsWith('fix') && !commit.message.startsWith('Merged ') && !commit.message.startsWith('Merge '))
      .map(commit => {
        return constructMsg(commit)
      })
    return array
  }
  // Return array of specified commit type, if passed
  array = commitsArray
    .filter(commit => commit.message.startsWith(type))
    .map(commit => {
      return constructMsg(commit, type)
    })
  return array
}

function constructMsg(commit, type) {
  let body = ''
  if (commit.body) {
    Object.entries(commit.body).forEach(line => {
      if (!line[1] || line[1] === '') return
      body += ` ${line[1]}  \n`
    })
    body = body === '' ? '' : `  \n${body}`
  }
  const commitMessage = type ? commit.message.replace(type, '') : commit.message
  const msg = `* ${commitMessage} ([${commit.sha.substring(
      0,
      6
    )
    }](https://bitbucket.org/softlimit/softlimit-framework-2/commits/${
      commit.sha
    }))\n${body}`
  return msg
}

// add list of commit messages to the new changelog
function addListToChangelog(list, heading) {
  let entry = ''
  if (list.length === 0) return
  entry += `## ${heading}\n`
  list.forEach(chore => {
    entry += chore
  })
  entry += '\n'
  return entry
}
