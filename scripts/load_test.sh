#!/bin/bash
for i in {1..50}; do
  curl -s http://localhost:3000 > /dev/null
done
