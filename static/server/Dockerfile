FROM node:10.15.3-alpine AS base

FROM base AS dependencies

WORKDIR /www

ADD src/package.json .
ADD src/yarn.lock .
RUN yarn install

FROM base

RUN GRPC_HEALTH_PROBE_VERSION=v0.3.1 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

WORKDIR /www

COPY --from=dependencies /www/node_modules ./node_modules
COPY ./src .

EXPOSE 50001

CMD ["yarn", "start"]
