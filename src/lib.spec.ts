import { foo } from './lib';

describe('foo', () => {
    it('returns bar', () => {
        expect(foo()).toBe('bar');
    });
});
