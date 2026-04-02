#!/bin/bash

set -a
# shellcheck source=.env
[ -f .env ] && source .env
set +a

export MCP_TRANSPORT=http

node dist/index.js
