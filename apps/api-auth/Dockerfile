FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm build

EXPOSE 7000

CMD ["node", "dist/main.js"]
