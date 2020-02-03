// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var proto_geoservice_pb = require('../proto/geoservice_pb.js');

function serialize_geoservice_Distance(arg) {
  if (!(arg instanceof proto_geoservice_pb.Distance)) {
    throw new Error('Expected argument of type geoservice.Distance');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geoservice_Distance(buffer_arg) {
  return proto_geoservice_pb.Distance.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geoservice_Points(arg) {
  if (!(arg instanceof proto_geoservice_pb.Points)) {
    throw new Error('Expected argument of type geoservice.Points');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geoservice_Points(buffer_arg) {
  return proto_geoservice_pb.Points.deserializeBinary(new Uint8Array(buffer_arg));
}


var GeoServiceService = exports.GeoServiceService = {
  distanceBetween: {
    path: '/geoservice.GeoService/DistanceBetween',
    requestStream: false,
    responseStream: false,
    requestType: proto_geoservice_pb.Points,
    responseType: proto_geoservice_pb.Distance,
    requestSerialize: serialize_geoservice_Points,
    requestDeserialize: deserialize_geoservice_Points,
    responseSerialize: serialize_geoservice_Distance,
    responseDeserialize: deserialize_geoservice_Distance,
  },
};

exports.GeoServiceClient = grpc.makeGenericClientConstructor(GeoServiceService);
