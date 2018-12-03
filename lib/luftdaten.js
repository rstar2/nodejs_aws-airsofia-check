const request = require('request-promise-native');

const types = {
    'PM2.5': 'PM2.5',
    'PM10': 'PM10',
};

/**
 * Work directly with the Luftdaten API for a single node.
 * @param {Number} node the air station ID
 * @param {Object} type the measurement type
 * @return {Promise<Number>}
 */
const get = (node, type) => {
    console.log(`Fetching air-data for ${node}`);

    const qs = {
        db: 'feinstaub',
        // TODO: 
        q: `SELECT moving_average(mean("sds011_p1"), 96) AS "${type}" FROM "feinstaub" WHERE ("node" =~ /^${node}$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("sds011_p2"), 96) AS "PM2.5" FROM "feinstaub" WHERE ("node" =~ /^${node}$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("hpm_p1"), 96) AS "PM10" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("hpm_p2"), 96) AS "PM2.5" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("pms_p1"), 96) AS "PM10" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null);SELECT moving_average(mean("pms_p2"), 96) AS "PM2.5" FROM "feinstaub" WHERE ("node" =~ /^5545$/) AND time >= now() - 8d GROUP BY time(15m), "node" fill(null)`,
        epoch: 'ms',
    };
    const url = 'https://maps.luftdaten.info/grafana/api/datasources/proxy/3/query';
    return request({ url, qs, })
        .then(body => {
            console.log(`Fetching air-data for ${node} succeeded`/*, body*/);
            return body.value;
        })
        .catch(error => {
            console.error(`Fetching air-data for ${node} failed`/*, error*/);
            return -1;
        });
};

/**
 * Get a static snapshot of all the data and find needed nodes
 * @param {Number[]} nodes the air station IDs
 * @param {Object} type the measurement type
 * @return {Promise<Number[]>}
 */
const getAll = (nodes, type) => {
    console.log('Fetching air-data');

    // fix the type as this API uses its own defined types' names
    const mapping = {
        [types['PM10']]: 'P1',
        [types['PM2.5']]: 'P2',
    };
    type = mapping[type];

    return request('https://api.luftdaten.info/static/v2/data.dust.min.json')
        // request-promise doesn't transform the response body
        .then(body => JSON.parse(body))
        .then(body => {
            console.log('Fetched air-data');
            // [
            //     {
            //         "id": 2424621112,
            //         "timestamp": "2018-12-03 13:30:14",
            //         "location": {
            //             "id": 42,
            //             "latitude": "48.8000",
            //             "longitude": "9.0020",
            //             "altitude": "365.6",
            //             "country": "DE"
            //         },
            //         "sensor": {
            //             "id": 92,
            //             "sensor_type": {
            //                 "id": 14,
            //                 "name": "SDS011",
            //                 "manufacturer": "Nova Fitness"
            //             }
            //         },
            //         "sensordatavalues": [
            //             {
            //                 "id": 5157249145,
            //                 "value": "1.67",
            //                 "value_type": "P1"
            //             },
            //             {
            //                 "id": 5157249147,
            //                 "value": "0.60",
            //                 "value_type": "P2"
            //             }
            //         ]
            //     },
            //     ....
            //]

            // return body.value;
            let values = new Array(nodes.length);
            values = values.fill(-1).map((val, index) => {
                const node = nodes[index];
                const nodeVal = search(body, node, type);
                // if found node's value return it, otherwise return the current/default
                return nodeVal || val;
            });

            return values;
        })
        .catch(error => {
            console.error('Fetching air-data failed', error);
            return Array(nodes.length).fill(-1);
        });
};

/**
 * 
 * @param {Array} items 
 * @param {Number} node 
 * @param {String} type
 * @return {Number} 
 */
const search = (items, node, type) => {
    let value = null;

    let item = items.find(item => item.sensor.id === node);
    if (item) {
        const sensorData = item.sensordatavalues.find(sensorData => sensorData.value_type === type);
        if (sensorData) {
            value = sensorData.value;
        }
    }

    return +value;
};

module.exports = {
    get,
    getAll,
    types,
};
