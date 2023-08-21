FROM node:18
WORKDIR ../../Seek/
COPY package*.json ./
RUN npm install cors express nodemon uniqid multer-s3-v2 multer aws-sdk dotenv path axios mysql2 telesignsdk pm2
COPY . .
EXPOSE 3000
CMD ["pm2-runtime", "start", "server.js"]