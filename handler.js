const dateFormat = require('date-fns/format');

const luftdaten = require('./lib/luftdaten');

// initialize a Twilio client to send SMS
const twilio = require('./lib/twilio')(process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_SENDER);

const LUFTDATEN_NODES = (process.env.LUFTDATEN_NODE || '5545, 10945').split(',')
    .map(str => +str.trim());
const LUFTDATEN_CHECK_TYPE = luftdaten.type['PM2.5'];

module.exports.check = async (event, context, callback) => {
    let response;
    console.time('Invoking function check took');

    // start all requests concurrently and wait for tall responses
    const requests = LUFTDATEN_NODES.map(node => luftdaten.get(node, LUFTDATEN_CHECK_TYPE));
    const airs = await Promise.all(requests);

    // airs.reduce();

    // TODO: update the DynamoDB last-checked item
    const isChanged = true;

    // if there's a need to send SMS
    if (isChanged) {
        // TODO: Create a proper SMS message
        // backspace the 'a' date-formatting param
        response = `Checked on ${dateFormat(Date.now(), 'MMM DD \\at HH:mm')}`;

        try {
            await twilio.sendSMS(process.env.TWILIO_RECEIVER, response);
        } catch (e) {
            console.warn('Failed to send SMS with Twilio Service');
        }
    }

    console.timeEnd('Invoking function check took');

    callback(null, response);
};

