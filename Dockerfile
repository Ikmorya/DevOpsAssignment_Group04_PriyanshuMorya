FROM node:18-alpine

WORKDIR /app

# Copy backend package files first for layer caching
COPY backend/package*.json ./

RUN npm install --production

# Copy backend source files
COPY backend/ .

EXPOSE 3001

CMD ["node", "server.js"]
