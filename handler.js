const dateFormat = require('date-fns/format');
const addHours = require('date-fns/add_hours');

// uncomment when used with "$ sls invoke local -f check"
// process.env.AWS_DYNAMODB_CHECK = 'my-airsofia-check-dev';
// process.env.AWS_PROFILE = 'my-expirations-check';


const db = require('./lib/dynamodb')(process.env.AWS_DYNAMODB_CHECK);
const luftdaten = require('./lib/luftdaten');

// initialize an SMS API gateway
const smsapi = require('./lib/smsapi')(process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_SENDER);

const ses = require('./lib/aws-ses')(process.env.AWS_SES_SENDER);

/**
 * 
 * @param {Stirng} str 
 */
const parseEnvArrayValues = (str, asNumber = false) => {
    if (!str) return [];

    return str
        .split(',')
        .map(str => {
            str = str.trim();
            return asNumber ? +str : str;
        });
};

const LUFTDATEN_NODES = parseEnvArrayValues(process.env.LUFTDATEN_NODES || '5545, 10945', true);
const LUFTDATEN_CHECK_TYPE = process.env.LUFTDATEN_TYPE || luftdaten.types['PM2.5'];

// const ALLOWED_MEASURE = 50; // for PM10
const ALLOWED_MEASURE = 30; // for PM2.5

const color = (value) => {
    let color;
    if (color <= ALLOWED_MEASURE) {
        color = "Green :)";
    } else {
        color = "Yellow";

        if (color > 3 * ALLOWED_MEASURE) {
            color = "Red";

            if (color > 10 * ALLOWED_MEASURE) {
                color = "Purple";

                if (color > 20 * ALLOWED_MEASURE) {
                    color = "Death";
                }
            }
        }
        color += " :(";
    }

    return color;
};


module.exports.check = async (event, context, callback) => {
    let response;
    console.time('Invoking function check took');

    // 1. use the main API - for each single node 
    // start all requests concurrently and wait for tall responses
    // const requests = LUFTDATEN_NODES.map(node => luftdaten.get(node, LUFTDATEN_CHECK_TYPE));
    // let values = await Promise.all(requests);

    // 2. fetch all the data and check only the specified nodes
    let values = await luftdaten.getAll(LUFTDATEN_NODES, LUFTDATEN_CHECK_TYPE);

    // if all nodes failed the no mean value could be calculated
    values = values.filter(val => val >= 0);
    if (!values.length) {
        callback(null, 'Failed to get any measures');
        return;
    }

    // get mean value
    let value = values.reduce((sum, val) => val + sum, 0) / values.length;
    value = value | 0;  // remove the floating part => 3.1 |0 === 3 , 3.9 | 0 === 3

    console.log('Values:', values);
    console.log('Mean:', value);

    // get old value and update with the new
    const oldItem = await db.get(LUFTDATEN_CHECK_TYPE);
    const oldValue = oldItem && oldItem.value;
    console.log('Old Mean:', oldValue);

    // update the DB anyway
    await db.set(LUFTDATEN_CHECK_TYPE, value);

    const predicate = val => val > ALLOWED_MEASURE;
    const negate = predicate => (...args) => predicate(...args);
    const negPredicate = negate(predicate);

    let isChanged = !oldValue ||
        (predicate(oldValue) && negPredicate(value)) ||
        (negPredicate(oldValue) && predicate(value));

    // if there's a need to send SMS
    if (isChanged) {
        // backspace the 'a' date-formatting param - so 'MMM DD \\at HH:mm'
        response = `${color(value)} - ${value}. Checked on ${dateFormat(addHours(Date.now(), 2), 'MMM DD \\at HH:mm')}`;

        console.log('Notifying with:', response);

        try {
            await ses.sendSMS(parseEnvArrayValues(process.env.AWS_SES_RECEIVER), response, 'Air Sofia Update');
        } catch (e) {
            console.warn('Failed to send Email with AWS SES Service');
            console.error(e);
        }

        try {
            await smsapi.sendSMS(process.env.TWILIO_RECEIVER, response);
        } catch (e) {
            console.warn('Failed to send SMS');
            console.error(e);
        }
    }

    console.timeEnd('Invoking function check took');

    callback(null, response);
};

