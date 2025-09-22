#!/bin/bash
# Force Railway to recognize our Dockerfile
echo "Forcing Railway deployment with Dockerfile..."
echo "Build context: $(pwd)"
echo "Files in root:"
ls -la
echo "Dockerfile exists: $(test -f Dockerfile && echo 'YES' || echo 'NO')"
echo "railway.toml exists: $(test -f railway.toml && echo 'YES' || echo 'NO')"
echo "railway.json exists: $(test -f railway.json && echo 'YES' || echo 'NO')"
