# Multi-stage Dockerfile that adapts based on NODE_ENV

# Stage 1: Base image with Node.js
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./

# Stage 2: Dependencies
FROM base as dependencies
RUN npm ci

# Stage 3: Development
FROM dependencies as development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 4: Build for production
FROM dependencies as build
COPY . .
RUN npm run build

# Stage 5: Production with nginx
FROM nginx:alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Final stage selection based on NODE_ENV
FROM ${NODE_ENV:-production} as final