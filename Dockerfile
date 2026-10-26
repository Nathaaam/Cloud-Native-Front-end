# Multi-stage build for frontend
# Stage 1: Build with Node and Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Declare build-time arguments
# These come from docker-compose.yml build.args
ARG VITE_API_URL=http://localhost:8090/api/v1
# Cognito IDs have no default: they must come from .env
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_USER_POOL_CLIENT_ID
ARG VITE_AWS_REGION=us-east-1

# Convert ARG to ENV so they're available during npm run build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID
ENV VITE_COGNITO_USER_POOL_CLIENT_ID=$VITE_COGNITO_USER_POOL_CLIENT_ID
ENV VITE_AWS_REGION=$VITE_AWS_REGION

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY public ./public
COPY src ./src
COPY index.html vite.config.ts tsconfig*.json ./

# Build the application
# Build-time environment variables (VITE_*) are now embedded in the bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install wget for healthchecks
RUN apk add --no-cache wget

# Remove default nginx config
RUN rm /etc/nginx/nginx.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
