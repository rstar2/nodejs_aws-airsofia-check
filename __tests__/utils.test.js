const utils = require('../lib/utils');

describe('Utils suite', () => {

    const ALLOWED_MEASURE = 30;
    const predicate = utils.createPredicate(ALLOWED_MEASURE);
    const negPredicate = utils.createNegatePredicate(predicate);

    const isChanged = (value, oldValue) => {
        let isChanged = !oldValue ||
            (predicate(oldValue) && negPredicate(value)) ||
            (negPredicate(oldValue) && predicate(value));
        return isChanged;
    };

    test('should change on no oldValue', () => {
        const value = 10;
        expect(isChanged(value)).toBeTruthy();
    });

    test('should change on greater', () => {
        const oldValue = 10;
        const value = 40;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should change on smaller', () => {
        const oldValue = 40;
        const value = 10;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should not change on above', () => {
        const oldValue = 40;
        const value = 50;
        expect(isChanged(value, oldValue)).toBeFalsy();
    });

    test('should not change on below', () => {
        const oldValue = 30;
        const value = 20;
        expect(isChanged(value, oldValue)).toBeFalsy();
    });
});
