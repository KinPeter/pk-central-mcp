FROM ghcr.io/anomalyco/opencode

RUN apk add --no-cache nodejs npm

WORKDIR /home/opencode/pk-central-mcp

COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev

COPY dist ./dist

COPY opencode/AGENTS.md /home/opencode/AGENTS.md
COPY opencode/opencode.json /home/opencode/opencode.json

WORKDIR /home/opencode

ENTRYPOINT []
CMD ["opencode", "web", "--hostname", "0.0.0.0", "--port", "4999"]
