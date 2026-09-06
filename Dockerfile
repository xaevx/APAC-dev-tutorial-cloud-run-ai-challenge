# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set Production Environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy Backend Code & Dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
COPY backend/src ./src

# Copy Compiled Frontend Assets to Backend Public Folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose Cloud Run Port
EXPOSE 8080

# Run Non-Root Container User
USER node

# Launch Application
CMD ["node", "src/index.js"]
