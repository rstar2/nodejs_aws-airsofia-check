

const createPredicate = max => val => val > max;
const createNegatePredicate = predicate => (...args) => !predicate(...args);

exports.createPredicate = createPredicate;
exports.createNegatePredicate = createNegatePredicate;

