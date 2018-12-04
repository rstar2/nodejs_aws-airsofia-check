const AWS = require('aws-sdk');

module.exports = (fromSender = process.env.AWS_SES_SENDER) => {

    const SES = new AWS.SES();

    return {
        /**
		 * Sends SMS to a phone (For trial accounts this 'to' must be verified phone number)
		 * @param {String} to
		 * @param {String} message
		 * @param {String} subject
		 * @returns {Promise<SES.Types.SendEmailResponse>}
		 */
        sendSMS(to, message, subject) {
            const emailParams = {
                Source: fromSender, // SES SENDING EMAIL
                Destination: {
                    ToAddresses: [
                        to, // SES RECEIVING EMAIL
                    ],
                },
                Message: {
                    Body: {
                        Text: {
                            Charset: 'UTF-8',
                            Data: message,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject,
                    },
                },
            };
            return SES.sendEmail(emailParams).promise();
        },
    };
};
