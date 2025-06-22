# Multi-stage build for React application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Fix case sensitivity issues for assets
RUN find . -name "*.png" -exec sh -c 'echo "Found: $1"' _ {} \;

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install necessary packages for SSL
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for HTTPS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports for both HTTP and HTTPS
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider https://localhost:443 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 