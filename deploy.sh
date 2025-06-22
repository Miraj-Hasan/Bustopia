#!/bin/bash
set -e

cd ~/SWE/Bustopia

# Stop and remove all running containers, networks, and orphaned stuff
echo "[0/3] Stopping and removing existing containers, networks, and orphaned stuff"
docker-compose down --volumes --remove-orphans

# Optionally: prune dangling images
docker image prune -f

echo "[1/3] Pulling newest images from Docker Hub"
docker-compose pull

echo "[2/3] Recreating containers"
docker-compose up -d --remove-orphans

echo "[3/3] Showing running containers"
docker ps
