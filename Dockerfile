FROM node:20-slim
RUN apt-get update && apt-get install -y ffmpeg libvips-dev libwebp-dev git
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start:optimized"]