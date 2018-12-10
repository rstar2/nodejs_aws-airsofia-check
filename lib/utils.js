

const createPredicate = max => val => val > max;
const createNegatePredicate = predicate => (...args) => !predicate(...args);

exports.createPredicate = createPredicate;
exports.createNegatePredicate = createNegatePredicate;


exports.createGetStep = (allowedThreshold) => {

    const steps = [
        {
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



