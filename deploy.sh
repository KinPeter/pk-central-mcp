#!/bin/bash

set -e

# 1. Bump patch version in package.json
RAW=$(npm version patch --no-git-tag-version)
NEW_VERSION="${RAW#v}"
echo "Bumped to version: $NEW_VERSION"

# 1b. Update docker-compose.yml image version
DC_FILE="docker-compose.yml"
if [ -f "$DC_FILE" ]; then
  sed -i "s|\(image: kinp/pk-central-mcp:\)[^ ]*|\1$NEW_VERSION|" "$DC_FILE"
  echo "Updated $DC_FILE image tag to $NEW_VERSION"
fi

# 2. Build TypeScript
npm run build

# 3. Build Docker image with new version tag
IMAGE="kinp/pk-central-mcp"
docker build -t "$IMAGE:$NEW_VERSION" .

# 4. Push to Docker Hub
docker push "$IMAGE:$NEW_VERSION"

echo "Deployed $IMAGE:$NEW_VERSION to Docker Hub."
