# Multi-stage build for React application
FROM node:20-slim AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies (this uses gnu version of native modules)
RUN npm ci

# Copy source code
COPY . .

# Optional asset logging
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

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider https://localhost:443 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
