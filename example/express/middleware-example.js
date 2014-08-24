/**
 *
 *
 * Accessing "http://0.0.0.0:8080/people" should render all people in storage.
 * Accessing "http://0.0.0.0:8080/people/smith" should render JSON object from users.json.
 *
 */
var _ = require('lodash');
var Waterline = require('../..');
var express = require('express');
var app = express();

var fakeVehicles = require( './fixtures/vehicles.json' );
var fakeUsers = require( './fixtures/users.json' );

app.use( Waterline.Middleware({
  adapters: {
    disk: require( 'sails-disk' )
  },
  collections: {
    person: Waterline.Collection.extend( require( './models/person' )),
    vehicle: Waterline.Collection.extend( require( './models/vehicle' ))
  },
  connections: {
    diskStore: {
      adapter: 'disk'
    }
  },
  options: {
    sessions: false
  }
}));

app.get( "/people/:lastName", function (req, res) {

  var _query = { lastName: req.param( 'lastName' ) };

  req.models.person.find( _query, function( err, data ) {

    res.send({
      ok: true,
      query: _query,
      data: data
    });

  });

});

app.get( "/people", function (req, res) {

  req.models.person.find( function( err, data ) {

    res.send({
      ok: true,
      message: 'We are using req.models.person.find() to fetch list of people.',
      data: data
    });

  });

});

app.once( 'waterline:ready', function( error, waterline ) {
  console.log( 'waterline:ready', error || typeof waterline );

  // We wait to start the HTTP server until Waterline is ready.
  app.listen(8080, function() {
    console.log( 'Server started on %s:%s.', this.address().address, this.address().port );
  });

});

app.once( 'waterline:models:ready', function( error, models ) {
  console.log( 'waterline:models:ready', error || typeof models );

  // There should be a "waterline" property that was added by the Waterline.Middleware.
  app.models.person.createEach( fakeUsers, app.emit.bind( app, 'model:person:created', null ) );
  app.models.vehicle.createEach( fakeVehicles, app.emit.bind( app, 'model:vehicle:created', null ) );

});
