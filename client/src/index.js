const { name, version } = require('./package.json');
const environment = process.env.NODE_ENV || 'development';
const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const pino = require('pino');

const SVC_PROTO_PATH = path.join(__dirname, './proto/geoservice.proto');
const { geoservice } = _loadProto(SVC_PROTO_PATH);

const PORT = process.env.PORT || 3000;
const GEOSVC_IP = process.env.GRPC_SERVER || 'localhost:50051';

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
  });
  return grpc.loadPackageDefinition(packageDefinition);
}

const client = new geoservice.GeoService(GEOSVC_IP, grpc.credentials.createInsecure());

const getDistance = ({ lat1, lng1, lat2, lng2 }) => new Promise((resolve, reject) => {
  const request = {
    origin: {
      lat: parseFloat(lat1),
      lng: parseFloat(lng1)
    },
    destination: {
      lat: parseFloat(lat2),
      lng: parseFloat(lng2)
    },
  }

  client.distanceBetween(request, (error, distance) => {
    if (error != null) reject(error);
    resolve(distance);
  });
});

const app = require('express')();
const expressPino = require('express-pino-logger')({ logger });

app.use(expressPino)
app.get('/status', (req, res) => res.status(200).json({ name, version, environment }));
app.get('/', async (req, res) => {
  const { lng1, lat1, lng2, lat2 } = req.query;
  if (!lng1 || !lat1 || !lng2 || !lat2) return res.send('Invalid query: eg format; /?lng1=10.111&lat1=10.111&lng2=10.111&lat2=10.111');
  try {
    const { distance } = await getDistance({ lat1, lng1, lat2, lng2 });
    return res.status(200).send({ distance, unit: 'meters' })
  } catch (error) {
    logger.error(error.stack);
    return res.status(500).send({ error })
  }
});

app.use(function (err, req, res, next) {
  logger.error(err.stack)
  return res.status(500).send('Something broke!')
})

app.listen(PORT, () =>
  logger.info(`Express server listening on port ${PORT}!`)
);
