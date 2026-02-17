FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies for database package first
COPY packages/database/package.json packages/database/
COPY packages/database/prisma/ packages/database/prisma/

WORKDIR /app/packages/database
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Install dependencies for backend
WORKDIR /app
COPY packages/backend/package.json packages/backend/
COPY packages/backend/tsconfig.json packages/backend/

WORKDIR /app/packages/backend
RUN npm install

# Copy source code
COPY packages/backend/src/ src/
COPY packages/backend/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]
