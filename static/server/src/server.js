const { name, version } = require('./package.json');
const environment = process.env.NODE_ENV || 'development';
const messages = require('./proto/geoservice_pb');
const services = require('./proto/geoservice_grpc_pb');
const health_messages = require('./proto/health_pb');
const health_services = require('./proto/health_grpc_pb');
const grpc = require('grpc');
const pino = require('pino');
const PORT = process.env.PORT || 50001;

const { getDistance } = require('geolib');

const logger = pino({
  name,
  messageKey: 'message',
  changeLevelName: 'severity',
  useLevelLabels: true
}).child({ version, environment });

/**
 * Endpoint for health checks
 */
function check(call, callback) {
  const reply = new health_messages.HealthCheckResponse();
  reply.setStatus(proto.grpc.health.v1.HealthCheckResponse.ServingStatus.SERVING);
  callback(null, reply);
}

function pointKey(point) {
  return [point.getLng(), point.getLat()];
}

/**
 * Endpoint for calculating the distance between to points
 */
function distanceBetween(call, callback) {
  const origin = pointKey(call.request.getOrigin());
  const destination = pointKey(call.request.getDestination());
  const distance = getDistance(origin, destination);
  const reply = new messages.Distance();
  reply.setDistance(distance);
  callback(null, reply);
}

function main() {
  logger.info(`Starting gRPC server on port ${PORT}...`);
  const server = new grpc.Server();
  server.addService(services.GeoServiceService, { distanceBetween });
  server.addService(health_services.HealthService, { check });
  server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
  server.start();
}

main();