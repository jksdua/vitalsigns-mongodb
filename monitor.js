/* jshint node:true */

'use strict';

var DEFAULT_SAMPLE_FREQ = 50;

/**
 * Initialize the VitalSigns module.
 *
 * @param {{db, freq}} options
 * @returns {{name: string, report: Function, destroy: Function}}
 */
module.exports = function(options) {
	if (!options)
		options = {};
	var running = true;

	// supports both node-mongodb-native and monk
	var db = options.db.stats ? options.db : options.db.driver;

	var dbStats = {
		// starts off as unhealthy
		ok: 0,
		err: new Error('waiting for stats')
	};

	function getReport(calcQueue, tickBatch) {
		return dbStats;
	}

	/**
	 * Starts an ongoing process that runs a stat query against the database.
	 */
	function startLoopMonitor() {
		var done = false;

		setTimeout(function() {
			db.stats(function(err, stats) {
				done = true;

				if (err) {
					dbStats = { ok: 0, err: err };
				} else {
					dbStats = stats;
					// unknown upstream error
					if (!stats.ok) {
						dbStats.err = 'unknown upstream error';
					}
				}

				if (running) {
					startLoopMonitor();
				}
			});

			// check for timeout since an unreachable host takes ages to timeout
				// this is handy if the network goes down
			setTimeout(function() {
				if (!done) {
					dbStats = { ok: 0, err: 'timeout error' };
				}
			}, (options.freq || DEFAULT_SAMPLE_FREQ) * 5);
		}, options.freq || DEFAULT_SAMPLE_FREQ);
	}
	startLoopMonitor();

	return {
		name: 'vitalsigns-mongodb',
		report: getReport,
		destroy: function() { running = false; }
	};
};
