# Use official Node.js image
FROM node:25-alpine AS builder

# Create app directory
WORKDIR /app

# Install all dependencies for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source and build
COPY . .
RUN npm run build

# Runtime image with production deps only
FROM node:25-alpine AS runtime

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
