const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 * 
 * @param {String} action
 * @param {Object} params
 * @return {Promise}
 */
const exec = (action, params) => {
    return dynamoDb[action](params).promise();
};

module.exports = (TableName) => {

    return {
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
                TableName,
            };
            return exec('get', params)
                // returned data is { Item }
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
                TableName,
            };
    
            return exec('put', params)
                .then(() => Item);
        },
    }

};
