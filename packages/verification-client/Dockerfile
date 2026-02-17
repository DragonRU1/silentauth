FROM node:20-alpine

WORKDIR /app/packages/verification-client

COPY packages/verification-client/package.json .
RUN npm install

COPY packages/verification-client/ .

EXPOSE 3001

CMD ["npx", "next", "dev", "--hostname", "0.0.0.0", "--port", "3001"]
