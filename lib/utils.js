

const createPredicate = max => val => val > max;
const createNegatePredicate = predicate => (...args) => !predicate(...args);

exports.createPredicate = createPredicate;
exports.createNegatePredicate = createNegatePredicate;

/**
 * 
 * @param {Number} allowedThreshold 
 */
exports.createGetStep = (allowedThreshold) => {
    if (false === allowedThreshold instanceof Number &&
        typeof allowedThreshold !== 'number')
        throw new Error(`Only numbers are allowed for 'allowedThreshold': ${allowedThreshold}`);

    const steps = [
        {
            threshold: 0,
            color: 'Green',
            emo: ':)',
        },
        {
            threshold: allowedThreshold,
            color: 'Yellow',
            emo: ':(',
        },
        {
            threshold: 3 * allowedThreshold,
            color: 'Red',
            emo: ':$',
        },
        {
            threshold: 10 * allowedThreshold,
            color: 'Purple',
            emo: ':/',
        },
        {
            threshold: 25 * allowedThreshold,
            color: 'Death',
            emo: '***',
        },
    ];

    const getStep = (value) => {
        let index = steps.length;

        while (--index > 0) {
            if (value > steps[index].threshold)
                break;
        }

        return {
            ...steps[index],
            index,
        };
    };
    return getStep;
};

/**
 * 
 * @param {Function} getStep function created with the "createGetStep" higher-order-function
 * @param {Number} value 
 * @param {Number} [oldValue]
 */
exports.isChanged = (getStep, value, oldValue) => {
    return (oldValue === undefined) ||
        (getStep(oldValue).index != getStep(value).index);
};



