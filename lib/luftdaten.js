const request = require('request-promise-native');
/**
 * 
 * @param {Number} node the air station ID
 * @param {Object} type the measurement type
 * @return {Promise<Object>}
 */
const get = (node, type) => {
    const qs = {
        db: 'feinstaub',
        q: `SELECT moving_average(mean("sds011_p1"), 96) AS "${type}" FROM "feinstaub" WHERE ("node" =~ /^${node}$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("sds011_p2"), 96) AS "PM2.5" FROM "feinstaub" WHERE ("node" =~ /^${node}$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("hpm_p1"), 96) AS "PM10" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("hpm_p2"), 96) AS "PM2.5" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("pms_p1"), 96) AS "PM10" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("pms_p2"), 96) AS "PM2.5" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null)`,
        epoch: 'ms',
    };

    console.log('Fetching air-data');
    const url = 'https://maps.luftdaten.info/grafana/api/datasources/proxy/3/query';
    return request({ url, qs, })
        .then(body => {
            console.log('Fetching air-data succeeded', body);
        })
        .catch(error => {
            console.error('Fetching air-data failed', error);
            throw error;
        });
};


module.exports = {
    get,
    type: {
        'PM2.5': 'PM2.5',
        'PM10': 'PM10',
    },
};
