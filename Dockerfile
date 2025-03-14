FROM node:20-slim as base
WORKDIR /app
COPY package*.json ./
COPY src ./src

FROM base as development
RUN npm install
CMD ["npm", "run", "dev"]

FROM base as production
RUN npm install --production
CMD ["npm", "start"] 