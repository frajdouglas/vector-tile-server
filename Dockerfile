FROM node:16

ENV AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=vectortiles;AccountKey=anskCQiQTc6B0ZfFGE0WmeS5tzrlcu5oUb8mwlDeWOhLPvyXpj4QUSTNXWiAvfgdnT6Fe2SFaLUpltf/ek+UIw==;EndpointSuffix=core.windows.net
WORKDIR /usr/src/app

COPY package*.json ./

# RUN npm ci --only=production
RUN npm install

COPY . .

EXPOSE 4000

CMD [ "node", "index.js" ]