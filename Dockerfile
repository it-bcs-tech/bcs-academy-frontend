# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build the SvelteKit application using @sveltejs/adapter-node
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# Stage 2: Production Server
FROM node:22-alpine

WORKDIR /app

# Copy build artifacts and production dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose internal container port
EXPOSE 3000

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Run Node.js production server
CMD ["node", "build/index.js"]
