import { clone, isArray } from 'lodash-es';
import { Transformation, createBuilder } from './builder';

describe('createBuilder', () => {
    interface Value {
        foo: string;
    }

    const initialValue: Value = {
        foo: 'bar'
    };

    const transformedValue: Value = {
        foo: 'BAR'
    };

    const initializer: Transformation<Value> = () => clone(initialValue);

    const transformation: Transformation<Value> = (value: Value) => ({
        ...value,
        foo: value.foo.toUpperCase()
    });

    it('accepts an initializer function that provides the initial value', () => {
        const builder = createBuilder(initializer);

        const value = builder.build();

        expect(value).toEqual(initialValue);
    });

    describe('build', () => {
        it('creates a new value on each execution of build()', () => {
            const builder = createBuilder(initializer);

            const value1 = builder.build();
            const value2 = builder.build();

            expect(value1).toEqual(value2);
            expect(value1).not.toBe(value2);
        });

        it('executes the transformations only on execution of build()', () => {
            const mockInitializer = jest.fn().mockImplementation(initializer);

            const builder = createBuilder(mockInitializer);

            expect(mockInitializer).not.toHaveBeenCalled();

            builder.build();

            expect(mockInitializer).toHaveBeenCalled();
        });
    });

    describe('buildMany', () => {
        const size = 3;

        it('executes build() as often as specified, returning an array of generated values', () => {
            const builder = createBuilder(initializer)
                .transform(transformation);

            const values: Value[] = builder.buildMany(size);

            expect(isArray(values)).toBe(true);
            expect(values.length).toBe(size);

            values.forEach(value => {
                expect(value).toEqual(transformedValue);
            });
        });

        it('executes the transformations for each iteration', () => {
            const mockInitializer = jest.fn().mockImplementation(initializer);

            createBuilder(mockInitializer)
                .buildMany(size);

            expect(mockInitializer).toHaveBeenCalledTimes(size);
        });
    });

    describe('transform', () => {
        it('adds a transformation function to the builder', () => {
            const builder = createBuilder(initializer);

            const value = builder
                .transform(transformation)
                .build();

            expect(value).toEqual(transformedValue);
        });
    });

});
