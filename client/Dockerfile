FROM node:10.15.3-alpine AS base

FROM base AS dependencies

WORKDIR /www

ADD src/package.json .
ADD src/yarn.lock .
RUN yarn install

FROM base

WORKDIR /www

COPY --from=dependencies /www/node_modules ./node_modules
COPY ./src .

EXPOSE 3000

CMD ["yarn", "start"]
