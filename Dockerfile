FROM docker.io/node:20.19-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy application files
COPY server/ ./server/
COPY shared/ ./shared/
COPY client/ ./client/
COPY vite.config.ts ./
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Set default port (Render will override with PORT env var if needed)
ENV PORT=10000
ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Health check (uses PORT env var, defaults to 10000)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 10000; require('http').get('http://localhost:' + port + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with tsx (runs TypeScript directly)
CMD ["npx", "tsx", "server/index.ts"]

