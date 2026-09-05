#!/bin/bash
echo "Building Docker image..."
docker build -t devops-app:latest .
echo "Build successful!"
