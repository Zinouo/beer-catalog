FROM node:20-alpine AS builder

WORKDIR /app
RUN npm config set strict-ssl false
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app
RUN npm config set strict-ssl false
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]