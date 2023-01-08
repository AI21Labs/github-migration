# Github Migration

Migrate Bitbucket repositories to Github

## Prerequisites

- Install nvm

```shell
brew install nvm
```

- Configure Node Version Manager (nvm) as described [here](https://github.com/AI21Labs/dev-envs/blob/master/docs/nodejs-dev.md#configure-version-manager)

- Configure SSH key in GitHub by clonning [dev-envs](https://github.com/AI21Labs/dev-envs) and running
[config-github.sh script](https://github.com/AI21Labs/dev-envs#github)

## Getting Started

### Install deps

```bash
source ./init.sh
```

### Github Mobile

- Download [GitHub app for mobile](https://github.com/mobile)

### Create Access Tokens

- [Create Github Personal Access Token (PAT) with the scopes specified](https://docs.github.com/en/early-access/enterprise-importer/preparing-to-migrate-with-github-enterprise-importer/managing-access-for-github-enterprise-importer#creating-a-personal-access-token-for-github-enterprise-importer)
- [Create Bitbucket Access Token](https://confluence.atlassian.com/bitbucketserver072/personal-access-tokens-1005335924.html#:~:text=To%20generate%20a%20personal%20access,the%20users%20personal%20tokens%20page.&text=Use%20permissions%20to%20get%20the%20correct%20access%20for%20different%20users.)
- Update the following in [.env-template](./.env-template) file:
  - GitHub username
  - GitHub and BitBucket tokens
  - Repository to migrate

## Migrate a Bitbucket Repository

- Run migration script

```bash
$ node migration.js --help
Usage: migration.js --ght [string] --bbt [string] --repo [string] --owner [string]

Options:
  --help     Show help                              [boolean]
  --version  Show version number                    [boolean]
  --ght      Github Personal Access Token (PAT)     [require]
  --bbt      BitBucket Personal Access Token (PAT)  [required]
  --repo     Repository to migrate                  [required]
  --owner    Github username                        [required]
```
  - For example:

  ```bash
  node migration.js --bbt BB_TOKEN --ght GH_TOKEN --owner USER --repo REPO_NAME
  ```

- Update repository *source control* property in [infra-teraform](https://bitbucket.org/ai21labs/infra-terraform/src/master/)
- Update Cloudbuild with the new github repository
  - [connect repository](https://console.cloud.google.com/cloud-build/triggers;region=global?project=publishing-337912)
  - replace `cloudBuild.yml` trigger
- Verify CI/CD for your module works
- Delete your repository from bitbucket once it becomes obsolete

## Contribute

- Run validation by leveraging [pre-commit](https://pre-commit.com) as described [here](https://github.com/present-simple/template)
  - Install `pre-commit install --install-hooks -t pre-commit -t commit-msg`
  - To run on-demand `pre-commit run -a`
- Submit a pull-request
