FROM node:20-bullseye AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm ci

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
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy built files from Builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "run", "start"]