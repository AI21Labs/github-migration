#!/usr/bin/env bash

set -u -e

# Install pre-requisites
brew install pre-commit
brew install gh

# activate pre-commit
pre-commit install --install-hooks -t pre-commit -t commit-msg

# config nvm and install deps
nvm install
nvm use
nvm alias default

npm install
