const { Octokit, App } = require("@octokit/core");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const assert = require('assert');
const {existsSync, readFile, writeFile, promises: fsPromises} = require('fs');

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
  await execAndPrint(`mkdir -p ${argv.repo}/.github/workflows`);
  await execAndPrint(`cp .github/CODEOWNERS ${argv.repo}/.github`);
  await execAndPrint(`cp .github/workflows/quality-checks.yml ${argv.repo}/.github/workflows`);

  readFile('.github/settings.yml', 'utf-8', function (err, contents) {
    if (err) {
      console.log(err);
      return;
    }
    const replaced = contents.replace(/name: github-migration/g, `name: ${argv.repo}`);
    writeFile(`${argv.repo}/.github/settings.yml`, replaced, 'utf-8', function (err) {
      console.log(err);
    });
  });

  if (existsSync(`${argv.repo}/cloudbuild.yaml`))
  readFile('cloudbuild.yaml', 'utf-8', function (err, contents) {
    if (err) {
      console.log(err);
      return;
    }
    const replaced = contents.replace(/env: 'BITBUCKET_SSH_KEY'/g, `env: 'GH_SSH_KEY'`);
    writeFile(`${argv.repo}/cloudbuild.yaml`, replaced, 'utf-8', function (err) {
      console.log(err);
    });
  });

  if (!existsSync(`${argv.repo}/.pre-commit-config.yaml`)) {
    await execAndPrint(`cp .pre-commit-config.yaml ${argv.repo}`);
  }

  await execAndPrint(`\
    cd ${argv.repo} && \
    git add -A
    git commit -m \"ci: migrating from bitbucket\" && \
    git push -u origin master
    `
  );

  await execAndPrint(`cd .. && rm -rf ${argv.repo}`);
})();
