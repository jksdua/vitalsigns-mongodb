'use strict';

describe('#vitalsigns-mongodb', function() {
	const DB_URL = 'localhost/test';

	var monk = require('monk');
	var mongodb = require('mongodb');

	var rawDb;
	var monkDb = monk(DB_URL);

	var MongoClient = mongodb.MongoClient;

	// Use connect method to connect to the Server
	MongoClient.connect('mongodb://' + DB_URL, function(err, db) {
		rawDb = db;
	});

	var expect = require('chai').expect;

	var VitalSigns = require('vitalsigns');

	it('should initially return an error', function() {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: monkDb });

		expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.ok', 0);
		expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.err').match(/waiting/i);
		vitals.destroy();
	});

	it('should work with monk db', function(done) {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: monkDb });

		setTimeout(function() {
			expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.ok', 1);
			vitals.destroy();
			done();
		}, 100);
	});

	it('should work with raw db', function(done) {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: rawDb });

		setTimeout(function() {
			expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.ok', 1);
			vitals.destroy();
			done();
		}, 100);
	});

	it('should return an error if db is not listening', function(done) {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: monk('localhost:27016/bla') });

		setTimeout(function() {
			expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.ok', 0);
			expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.err').match(/failed\sto\sconnect/i);
 			vitals.destroy();
			done();
		}, 100);
	});

	it('should return an error if db host is unreachable', function(done) {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: monk('10.10.10.10/bla') });

		setTimeout(function() {
			expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.ok', 0);
			expect(vitals.getReport()).to.have.deep.property('vitalsigns-mongodb.err.errmsg').match(/timeout/i);
 			vitals.destroy();
			done();
		}, 500);
	});

	it('should return unhealthy if a constraint is added', function(done) {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: monk('localhost:27016/bla') });

		vitals.unhealthyWhen('vitalsigns-mongodb', 'ok').not.equals(1);

		setTimeout(function() {
			expect(vitals.getReport()).to.have.property('healthy', false);
 			vitals.destroy();
			done();
		}, 100);
	});

	it('should return unhealthy initially', function() {
		var vitals = new VitalSigns();
		vitals.monitor(__dirname + '/monitor.js', { db: monk('localhost/test') });

		vitals.unhealthyWhen('vitalsigns-mongodb', 'ok').not.equals(1);

		expect(vitals.getReport()).to.have.property('healthy', false);
		vitals.destroy();
	});

	it('should support multiple databases if a name is given', function(done) {
		var vitals = new VitalSigns();

		// ok: 1
		vitals.monitor(__dirname + '/monitor.js', { db: monk('localhost/test'), name: 'mongodb-ok' });
		// ok: 0
		vitals.monitor(__dirname + '/monitor.js', { db: monk('localhost:27016/test'), name: 'mongodb-not-ok' });

		vitals.unhealthyWhen('mongodb-ok', 'ok').not.equals(1);

		setTimeout(function() {
			expect(vitals.getReport()).to.have.property('healthy', true);
			expect(vitals.getReport()).to.have.deep.property('mongodb-ok.ok', 1);
			expect(vitals.getReport()).to.have.deep.property('mongodb-not-ok.ok', 0);
			vitals.destroy();
			done();
		}, 100);
	});
});