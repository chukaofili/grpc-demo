const { name, version } = require('./package.json');
const environment = process.env.NODE_ENV || 'development';
const messages = require('./proto/geoservice_pb');
const services = require('./proto/geoservice_grpc_pb');
const grpc = require('grpc');
const PORT = process.env.PORT || 3000;
const GEOSVC_IP = process.env.GRPC_SERVER || 'localhost:50001';
const logger = require('pino')({
  name,
  messageKey: 'message',
  changeLevelName: 'severity',
  useLevelLabels: true
}).child({ version, environment });
const app = require('express')();
const pino = require('express-pino-logger')({ logger });
app.use(pino);

const client = new services.GeoServiceClient(GEOSVC_IP, grpc.credentials.createInsecure());
const getDistance = ({ lat1, lng1, lat2, lng2 }) => new Promise((resolve, reject) => {
  const origin = new messages.Point();
  origin.setLat(parseFloat(lat1));
  origin.setLng(parseFloat(lng1));

  const destination = new messages.Point();
  destination.setLat(parseFloat(lat2));
  destination.setLng(parseFloat(lng2));

  const request = new messages.Points();
  request.setOrigin(origin);
  request.setDestination(destination);

  client.distanceBetween(request, (error, response) => {
    if (error != null) reject(error);
    resolve(response.getDistance());
  });
});


app.get('/status', (req, res) => res.status(200).json({ name, version, environment }));
app.get('/', async (req, res) => {
  const { lng1, lat1, lng2, lat2 } = req.query;
  if (!lng1 || !lat1 || !lng2 || !lat2) return res.send('Invalid query: eg format; /?lng1=10.111&lat1=10.111&lng2=10.111&lat2=10.111');
  try {
    const distance = await getDistance({ lat1, lng1, lat2, lng2 });
    return res.status(200).send({ distance, unit: 'meters' })
  } catch (error) {
    logger.error(error.stack);
    return res.status(500).send({ error })
  }
});

app.use((err, req, res, next) => {
  logger.error(err.stack)
  return res.status(500).send('Something broke!')
})

app.listen(PORT, () =>
  logger.info(`Express server listening on port ${PORT}!`)
);
