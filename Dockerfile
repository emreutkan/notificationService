FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

COPY .env .env

EXPOSE 8080

CMD ["node", "index.js"]


# 1. Build the Docker image
# docker build -t prescription-notification-service .

# 2. Run the container, mapping port 3000 of the container to port 3000 on your host
# docker run -p 8080:8080 --name prescription-service prescription-notification-service
