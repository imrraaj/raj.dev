#!/bin/bash

# Determine the script's directory dynamically
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

# Navigate to the script's directory
cd "$REPO_DIR" || {
    echo "$(date +"%d %b %Y %H:%M:%S"): Failed to navigate to $REPO_DIR. Ensure it is a valid Git repository."
    exit 1
}
echo "${pwd}"
echo "$(date +"%d %b %Y %H:%M:%S"): Fetching remote repository..."
git fetch

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")
sh ./deploy.sh
# if [ $LOCAL = $REMOTE ];
# then
# 	echo "$(date +"%d %b %Y %H:%M:%S"): No changes detected in git"
# elif [ $LOCAL = $BASE ];
# then
# 	BUILD_VERSION=$(git rev-parse HEAD)
# 	echo "$(date +"%d %b %Y %H:%M:%S"): Changes detected, deploying new version: $BUILD_VERSION"
# 	sh ./deploy.sh
# elif [ $REMOTE = $BASE ]; then
# 	echo "$(date +"%d %b %Y %H:%M:%S"): Local changes detected, stashing"
# 	git stash
# 	./deploy.sh
# else
# 	echo "$(date +"%d %b %Y %H:%M:%S"): Git is diverged, this is unexpected."
# fi
