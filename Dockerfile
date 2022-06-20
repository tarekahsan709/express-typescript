FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV MONGODB_URI=mongodb://mongo:27017/node-typescript
RUN npm run buildprod
EXPOSE 3000
CMD [ "npm", "start" ]