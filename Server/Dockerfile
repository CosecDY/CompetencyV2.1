# FROM node:20-bullseye
# RUN apt-get update && apt-get install -y default-mysql-client
# WORKDIR /app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# RUN npx prisma generate --schema=prisma/competency.prisma && \
#     npx prisma generate --schema=prisma/sfia.prisma && \
#     npx prisma generate --schema=prisma/tpqi.prisma

# EXPOSE 3000

# CMD ["npm", "run", "dev"]
# Stage 1: Builder (Install all deps & Build)
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/ 

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=prisma/competency.prisma && \
    npx prisma generate --schema=prisma/sfia.prisma && \
    npx prisma generate --schema=prisma/tpqi.prisma

# Build TypeScript
RUN npm run build

# ---------------------------------------------------

# Stage 2: Production (Run code)
FROM node:20-bullseye-slim
# ใช้ slim เพื่อลดขนาด image (แต่ถ้าต้องใช้ lib พิเศษ ให้ใช้ bullseye ปกติ)
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy built files from Builder stage
COPY --from=builder /app/dist ./dist
# Copy generated prisma client (สำคัญมาก)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "run", "start"]