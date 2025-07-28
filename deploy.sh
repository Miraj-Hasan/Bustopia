#!/bin/bash
set -e

cd ~/SWE/Bustopia

# [0/3] Stop and clean up old containers, volumes, and network
echo "[0/3] Cleaning up containers and networks"
docker-compose down --remove-orphans
docker image prune -f
docker network prune -f

# [1/3] Pull latest images
echo "[1/3] Pulling newest images from Docker Hub"
docker-compose pull

# [2/3] Start fresh containers
echo "[2/3] Recreating containers"
docker-compose up -d --build --remove-orphans --force-recreate

# [3/3] List running containers
echo "[3/3] Running containers:"
docker ps
