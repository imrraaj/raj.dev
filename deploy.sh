#!/usr/bin/sh

git pull

echo "$(date --utc ): Releasing new server version"
echo "Running build"

docker compose rm -f
docker compose build

OLD_CONTAINER=$(docker ps -aqf "name=rajdev")
docker container rm -f $OLD_CONTAINER
docker compose up raj-dev -d
echo "Reloading caddy"
CADDY_CONTAINER=$(docker ps -aqf "name=caddy")
docker exec $CADDY_CONTAINER caddy reload -c /etc/caddy/Caddyfile
