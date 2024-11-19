#!/bin/sh

alias docker=/usr/local/bin/docker
whoami
git pull
echo "$(date +"%d %b %Y %H:%M:%S"): Releasing new server version"
echo "Running build..."

docker compose build --quiet
# Find the old container
OLD_CONTAINER=$(docker ps -aqf "name=rajdev")

# Check if the container exists
if [ -n "$OLD_CONTAINER" ]; then
    echo "Old container found: $OLD_CONTAINER. Removing..."
    docker container rm -f $OLD_CONTAINER
else
    echo "No old container found. Skipping removal."
fi
docker compose up -d
