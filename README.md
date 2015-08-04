# vitalsigns-mongodb
MongoDB monitor for vitalsigns

Runs **db.stats()** against a mongodb database


## Installation
In your project folder, type:

	npm i vitalsigns
	npm i vitalsigns-mongodb

## Basic Usage
Load up VitalSigns and add a mongodb monitor:

	var VitalSigns = require('vitalsigns'),
		vitals = new VitalSigns();

	// using monk
	var monk = require('monk');
	vitals.monitor('vitalsigns-mongodb', {db: monk('localhost/test')});

	// using node-mongodb-native
	var mongodb = require('mongodb');
	var MongoClient = mongodb.MongoClient;

	// Use connect method to connect to the Server
	MongoClient.connect('mongodb://localhost/test', function(err, db) {
		vitals.monitor('vitalsigns-mongodb', {db: db});
	});

We need to know when we go unhealthy...

	vitals.unhealthyWhen('vitalsigns-mongodb', 'ok').not.equals(1);

Identifying the issue

	var report = vitals.getReport();
	console.log(report['vitalsigns-mongodb'].err);


## Monitoring multiple databases

Vitalsigns supports custom names for monitors so you can monitor multiple databases by giving unique names

	vitals.monitor('vitalsigns-mongodb', {db: monk('localhost/app'), name: 'app_db'});
	vitals.monitor('vitalsigns-mongodb', {db: monk('localhost/secret', name: 'secret_db')});

We need to know when we go unhealthy...

	vitals.unhealthyWhen('app_db', 'ok').not.equals(1);


## Sample report

Single database

	{
		'vitalsigns-mongodb': {
			db: 'test',
			collections: 8,
			objects: 28,
			avgObjSize: 361.14285714285717,
			dataSize: 10112,
			storageSize: 29278208,
			numExtents: 15,
			indexes: 6,
			indexSize: 49056,
			fileSize: 67108864,
			nsSizeMB: 16,
			extentFreeList: { num: 0, totalSize: 0 },
			dataFileVersion: { major: 4, minor: 22 },
			ok: 1
		},
		healthy: true
	}

Multiple databases

	{
		'app_db': {
			db: 'test',
			collections: 8,
			objects: 28,
			avgObjSize: 361.14285714285717,
			dataSize: 10112,
			storageSize: 29278208,
			numExtents: 15,
			indexes: 6,
			indexSize: 49056,
			fileSize: 67108864,
			nsSizeMB: 16,
			extentFreeList: { num: 0, totalSize: 0 },
			dataFileVersion: { major: 4, minor: 22 },
			ok: 1
		},
		'secret_db': {
			ok: 0,
			err: { errmsg: '[Error: failed to connect to [localhost:27016]]' }
		},
		healthy: true
	}


## Options

- **db**: Monk or Mongodb database instance
- **freq**: Check frequency
