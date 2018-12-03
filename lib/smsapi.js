// access the environment variables
// const twilio = require('twilio');

module.exports = (accountSid, authToken, fromSender) => {

    // const client = new twilio(accountSid, authToken);

    return {
        /**
		 * Sends SMS to a phone (For trial accounts this 'to' must be verified phone number)
		 * @param {String} to
		 * @param {String} message
		 * @returns {Promise<>}
		 */
        sendSMS(to, message) {
            return Promise.resolve();

            // return client.messages.create({
            //     body: message,
            //     from: fromSender, // From a valid Twilio number,
            //     to,
            // });
        },
    };
};
