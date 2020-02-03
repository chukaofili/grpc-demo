const { name, version } = require('./package.json');
const environment = process.env.NODE_ENV || 'development';
const path = require('path');
const grpc = require('grpc');
const pino = require('pino');
const protoLoader = require('@grpc/proto-loader');
const { getDistance } = require('geolib');

const SVC_PROTO_PATH = path.join(__dirname, './proto/geoservice.proto');
const HEALTH_PROTO_PATH = path.join(__dirname, './proto/health/v1/health.proto');

const PORT = process.env.PORT || 50001;

const healthProto = _loadProto(HEALTH_PROTO_PATH).grpc.health.v1;
const { geoservice } = _loadProto(SVC_PROTO_PATH);

const logger = pino({
  name,
  messageKey: 'message',
  changeLevelName: 'severity',
  useLevelLabels: true
}).child({ version, environment });

/**
 * Helper function that loads a protobuf file.
 */
function _loadProto(path) {
  const packageDefinition = protoLoader.loadSync(path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
  );
  return grpc.loadPackageDefinition(packageDefinition);
}

/**
 * Endpoint for health checks
 */
function check(call, callback) {
  callback(null, { status: 'SERVING' });
}

/**
 * Endpoint for calculating the distance between to points
 */
function distanceBetween(call, callback) {
  const { origin, destination } = call.request
  const distance = getDistance(origin, destination);
  callback(null, { distance });
}

function main() {
  logger.info(`Starting gRPC server on port ${PORT}...`);
  const server = new grpc.Server();
  server.addService(geoservice.GeoService.service, { distanceBetween });
  server.addService(healthProto.Health.service, { check });
  server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
  server.start();
}

main();