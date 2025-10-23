# Multi-stage Dockerfile that adapts based on NODE_ENV

# Stage 1: Base image with Node.js
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./

# Stage 2: Install all dependencies (including devDependencies for build)
FROM base as dependencies
RUN npm ci --include=dev

# Stage 3: Development
FROM dependencies as development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 4: Build for production
FROM dependencies as build
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
COPY . .
RUN npm run build

# Stage 5: Production with Vite preview
FROM node:20-alpine as production
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
# Install dependencies including vite (needed for preview command)
RUN npm ci --include=dev
EXPOSE 8080
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]

# Final stage selection based on NODE_ENV
FROM ${NODE_ENV:-production} as final