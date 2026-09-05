#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ $RESPONSE -eq 200 ]; then
  echo "Health check passed!"
  exit 0
else
  echo "Health check failed with status $RESPONSE"
  exit 1
fi
