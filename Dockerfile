FROM node:13 as base

WORKDIR /home/panku/Vivi

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

#CMD ["node", "build/src/index.js"]
