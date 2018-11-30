const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const AWS_DYNAMODB_CHECK = process.env.AWS_DYNAMODB_CHECK;

/**
 * 
 * @param {String} action
 * @param {Object} params
 * @return {Promise}
 */
const exec = (action, params) => {
    return dynamoDb[action](params).promise();
};

module.exports = {
    /**
     * 
     * @param {String} id
     * @return {Promise} 
     */
    async get(id) {
        const params = {
            Key: {
                id,
            },
            TableName: AWS_DYNAMODB_CHECK,
        };
        return exec('get', params)
            // returned data is { Item }
            .then(data => console.dir(data) || data)
            .then(({ Item, }) => Item);
    },

    /**
     * 
     * @param {String} id
     * @param {Number} value
     * @return {Promise} 
     */
    async set(id, value) {
        const Item = {
            id,
            value,
            updatedAt: Date.now(),
        };
        const params = {
            Item,
            TableName: AWS_DYNAMODB_CHECK,
        };

        return exec('put', params)
            .then(() => Item);
    },

};
