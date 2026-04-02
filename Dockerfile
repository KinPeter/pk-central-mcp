FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist ./dist

ENV MCP_TRANSPORT=http
ENV MCP_PORT=4999
ENV MCP_HOST=0.0.0.0

EXPOSE 4999

CMD ["node", "dist/index.js"]
