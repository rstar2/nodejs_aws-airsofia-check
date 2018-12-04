const dateFormat = require('date-fns/format');

// uncomment when used with "$ sls invoke local -f check"
process.env.AWS_DYNAMODB_CHECK = 'my-airsofia-check-dev';
process.env.AWS_PROFILE = 'my-expirations-check';

const db = require('./lib/dynamodb')(process.env.AWS_DYNAMODB_CHECK);
const luftdaten = require('./lib/luftdaten');

// initialize an SMS API gateway
const smsapi = require('./lib/smsapi')(process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_SENDER);

const ses = require('./lib/aws-ses')(process.env.AWS_SES_SENDER);

const LUFTDATEN_NODES = (process.env.LUFTDATEN_NODES || '5545, 10945').split(',')
    .map(str => +str.trim());
const LUFTDATEN_CHECK_TYPE = process.env.LUFTDATEN_TYPE || luftdaten.types['PM10'];

// const ALLOWED_MEASURE = 50; // for PM10
const ALLOWED_MEASURE = 30; // for PM2.5

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
    let oldValue = await db.get(LUFTDATEN_CHECK_TYPE).value;
    await db.set(LUFTDATEN_CHECK_TYPE, value);

    let isChanged = !oldValue ||
        (oldValue >= ALLOWED_MEASURE && value < ALLOWED_MEASURE) ||
        (oldValue <= ALLOWED_MEASURE && value > ALLOWED_MEASURE);

    // if there's a need to send SMS
    if (isChanged) {
        // backspace the 'a' date-formatting param
        response = `${value <= ALLOWED_MEASURE ? 'Finally - ' : 'Fuck!!!'} ${value}. Checked on ${dateFormat(Date.now(), 'MMM DD \\at HH:mm')}`;

        try {
            await ses.sendSMS(process.env.AWS_SES_RECEIVER, response, 'Air Sofia Update');
        } catch (e) {
            console.warn('Failed to send Email with AWS SES Service');
        }

        try {
            await smsapi.sendSMS(process.env.TWILIO_RECEIVER, response);
        } catch (e) {
            console.warn('Failed to send SMS with Twilio Service');
        }
    }

    console.timeEnd('Invoking function check took');

    callback(null, response);
};

