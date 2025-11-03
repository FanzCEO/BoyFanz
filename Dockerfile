FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server/ ./server/
COPY public/ ./public/ 2>/dev/null || true

# Set default port (Render will override with PORT env var if needed)
ENV PORT=10000

# Expose port
EXPOSE 10000

# Health check (uses PORT env var, defaults to 10000)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 10000; require('http').get('http://localhost:' + port + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server/index.js"]

