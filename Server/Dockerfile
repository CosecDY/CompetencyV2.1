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
FROM node:20-bullseye

RUN apt-get update && apt-get install -y default-mysql-client

WORKDIR /app

# Install dependencies (dev deps excluded in production)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Generate prisma clients
RUN npx prisma generate --schema=prisma/competency.prisma && \
    npx prisma generate --schema=prisma/sfia.prisma && \
    npx prisma generate --schema=prisma/tpqi.prisma

# Build TypeScript → JavaScript
RUN npm run build

EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
