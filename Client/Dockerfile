# # Base image
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm ci

# # Copy all source code
# COPY . .

# # Expose port for dev server
# EXPOSE 5173

# # Start frontend dev server
# CMD ["npm", "run", "dev", "--", "--host"]
# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable
COPY --from=builder /app/dist /tmp/dist
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]



