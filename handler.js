const dateFormat = require('date-fns/format');

// initialize a Twilio client to send SMS
const twilio = require('.lib/twilio')(process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_SENDER);

module.exports.check = async (event, context, callback) => {
    // console.log("Event:");
    // console.dir(event);

    let response;
    console.time('Invoking function check took');

    try {
        await twilio.sendSMS(process.env.TWILIO_RECEIVER, response);
    } catch (e) {
        console.warn('Failed to send SMS with Twilio Service');
    }

    console.timeEnd('Invoking function check took');
    console.log(`Checked on ${dateFormat(Date.now(), 'MMM DD : HH mm')}`);
    callback(null, response);
};



