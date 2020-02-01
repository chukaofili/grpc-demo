const url = require('url');
const grpc = require('grpc');

const proto = grpc.load('interface.proto');

const GeoService = grpc.buildServer([proto.geo.GeoService.service]);

const server = new GeoService({
	'geo.GeoService': {
		distanceBetween: function(call, callback) {
			callback(null, getDistance(call.request));
		}
	}
});

function getDistance(points){
	return distance(points.origin.lat, points.origin.lng, points.destination.lat, points.destination.lng);
}

server.bind('0.0.0.0:50051');
server.listen();


// From http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
// User: Salvador Dali - http://stackoverflow.com/users/1090562/salvador-dali
function distance(lat1,lon1,lat2,lon2) {
	const R = 6371; // Radius of the earth in km
	const a =
		0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		(1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;
	return R * 2 * Math.asin(Math.sqrt(a));
}
////////////////////////////////////