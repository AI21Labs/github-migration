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

### Init Configuration

The script configuration is saved in a `.env` file in the root directory. To avoid configuration commits `.env` itself is not source controlled.

- To Init configuration run

```shell
npm run init-config
```

After running the command above open `.env` and verify that the configuration matches your local environment.

## Migrate a Bitbucket Repository

- Run migration script

```bash
npm run migrate
```

- Update Cloudbuild with the new github repository
- Verify CI/CD works
- Delete your repository from bitbucket once it becomes obsolete

## Contribute

- Run validation by leveraging [pre-commit](https://pre-commit.com) as described [here](https://github.com/present-simple/template)
  - Install `pre-commit install --install-hooks -t pre-commit -t commit-msg`
  - To run on-demand `pre-commit run -a`
- Submit a pull-request
