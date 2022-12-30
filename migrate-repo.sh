#!/usr/bin/env bash

set -u -e -o pipefail

REPO=''
USERNAME=''
BITBUCKET_TOKEN=''

function usages() {
  cat <<EOM
$(basename "$0") OPTIONS
OPTIONS:
  [-r|--repo <name>]      repository name
  [-u|--user <username>]  github username
  [-b|--bbt <name>]       bitbucket toake
  [-h|--help]             shows this help message
EOM
  exit 0
}

# parse arguments
# https://stackoverflow.com/a/33826763
while [[ $# -gt 0 ]]; do
  case $1 in
  -r | --repo)
    REPO="$2"
    shift
    ;;
  -u | --user)
    USER="$2"
    shift
    ;;
  -b | --bbt)
    BITBUCKET_TOKEN="$2"
    shift
    ;;
  -h | --help)
    usages
    ;;
  *)
    echo "Unknown parameter passed: $1"
    exit 1
    ;;
  esac
  shift
done

gh repo create "AI21Labs/$REPO" --private
gh api --method PUT -H "Accept: application/vnd.github+json" \
    /repos/AI21Labs/$REPO/import \
    -f vcs='subversion' \
    -f vcs_url="https://bitbucket.org/ai21labs/$REPO.git" \
    -f vcs_username=$USER \
    -f vcs_password="$BITBUCKET_TOKEN"

gh api -H "Accept: application/vnd.github+json" \
    /repos/AI21Labs/$REPO/import