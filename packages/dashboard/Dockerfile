FROM node:20-alpine

WORKDIR /app/packages/dashboard

COPY packages/dashboard/package.json .
RUN npm install

COPY packages/dashboard/ .

EXPOSE 3000

CMD ["npx", "next", "dev", "--hostname", "0.0.0.0", "--port", "3000"]
