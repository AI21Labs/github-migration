const { Octokit, App } = require("@octokit/core");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const assert = require('assert');

const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 --ght [string] --bbt [string] --repo [string] --owner [string]')
  .demandOption(['ght', 'bbt', 'repo', 'owner'])
  .argv;

const COMPLETE_STATUS = 'complete';

async function execAndPrint(command) {
  try {
    const { stdout, stderr } = await exec(command);
    console.log(stdout);
    console.log(stderr);
    return 0;
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
    process.exit(-1);
  }
}

(async () => {
  const octokit = new Octokit({
    auth: argv.ght
  })

  const createRepoResponse = await octokit.request('POST /orgs/AI21Labs/repos', {
    org: 'AI21Labs',
    name: argv.repo,
    homepage: 'https://github.com',
    'private': true,
    has_issues: true,
    has_projects: true,
    has_wiki: true
  });

  assert([200, 201].includes(createRepoResponse.status));

  const importResponse = await octokit.request(`PUT /repos/AI21Labs/${argv.repo}/import`, {
    owner: argv.owner,
    vcs_url: `https://bitbucket.org/ai21labs/${argv.repo}.git`,
    vcs_username: argv.owner,
    vcs_password: argv.bbt
  })

  assert([200, 201].includes(importResponse.status));

  var status = 'importing'
  while (status !== COMPLETE_STATUS) {
    const response = await octokit.request(`GET /repos/AI21Labs/${argv.repo}/import`);
    status = response.data.status;
    if (status !== COMPLETE_STATUS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`import status: ${status}`);
  }

  await execAndPrint(`git clone git@github.com:AI21Labs/${argv.repo}.git`);
  await execAndPrint(`\
    cd ${argv.repo} && \
    mkdir .github && \
    cp ../settings.yml .github && \
    git add -A && \
    git commit -m "settings.yaml" && \
    git push -u origin master\
    `);
})();