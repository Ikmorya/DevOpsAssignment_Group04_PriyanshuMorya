#!/bin/bash
echo "Building multistage container..."
docker build -f Dockerfile.multistage -t devops-app:multistage .
