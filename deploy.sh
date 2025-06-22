#!/bin/bash
set -e

cd ~/SWE/Bustopia

echo "[1/3] Pulling newest images from Docker Hub"
docker-compose pull

echo "[2/3] Recreating containers"
docker-compose up -d --remove-orphans

echo "[3/3] Showing running containers"
docker ps
