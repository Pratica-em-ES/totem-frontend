# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build argument for backend URL
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build argument for skipping type checks
ARG SKIP_TYPE_CHECK=false
ENV SKIP_TYPE_CHECK=${SKIP_TYPE_CHECK}

# install deps...
# ...existing code...

# build step: choose script based on SKIP_TYPE_CHECK
RUN if [ "$SKIP_TYPE_CHECK" = "true" ]; then \
      npm run build:skip-typecheck; \
    else \
      npm run build; \
    fi

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.production.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
