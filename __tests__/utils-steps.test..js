const utils = require('../lib/utils');

describe('Utils suite - steps', () => {

    const ALLOWED_MEASURE = 30;
    const getStep = utils.createGetStep(ALLOWED_MEASURE);

    const isChanged = (value, oldValue) => {
        return utils.isChanged(getStep, value, oldValue);
    };

    test('should change on no oldValue', () => {
        const value = 10;
        expect(isChanged(value)).toBeTruthy();
        console.log('use');
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

    test('should change on step up 1', () => {
        const oldValue = 40;
        const value = 100;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should change on step up 2', () => {
        const oldValue = 91;
        const value = 301;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should change on step up 3', () => {
        const oldValue = 301;
        const value = 800;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should change on step down 1', () => {
        const oldValue = 100;
        const value = 40;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should change on step down 2', () => {
        const oldValue = 301;
        const value = 91;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should change on step down 3', () => {
        const oldValue = 800;
        const value = 301;
        expect(isChanged(value, oldValue)).toBeTruthy();
    });

    test('should NOT change on "to 0"', () => {
        const oldValue = 5;
        const value = 0;
        expect(isChanged(value, oldValue)).toBeFalsy();
    });

    test('should NOT change on "from 0"', () => {
        const oldValue = 0;
        const value = 5;
        expect(isChanged(value, oldValue)).toBeFalsy();
    });
});
