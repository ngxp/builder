import { clone, isArray } from 'lodash-es';
import { createBuilder, Transformation } from './builder';

describe('createBuilder', () => {
    interface NestedValue {
        baz: number;
    }

    interface Value {
        foo: string;
        bar: NestedValue;
    }

    const initialValue: Value = {
        foo: 'bar',
        bar: {
            baz: 0
        }
    };

    const transformedValue: Value = {
        ...initialValue,
        foo: 'BAR'
    };

    const initialTransformation: Transformation<Value> = () => clone(initialValue);

    const transformation: Transformation<Value> = (value: Partial<Value>) => ({
        ...value,
        foo: value.foo!.toUpperCase()
    });

    it('accepts an initial transformation function that provides the initial value', () => {
        const builder = createBuilder(initialTransformation);

        const value = builder.build();

        expect(value).toEqual(initialValue);
    });

    it('accepts an array of transformation functions that provide the initial value', () => {
        const builder = createBuilder([
            initialTransformation,
            transformation
        ]);

        const value = builder.build();

        expect(value).toEqual(transformedValue);
    });

    describe('freeze', () => {
        it('freezes the value', () => {
            const builder = createBuilder(initialTransformation);

            const value = builder
                .freeze()
                .build();

            expect(Object.isFrozen(value)).toBe(true);
            expect(Object.isFrozen(value.bar)).toBe(true);
        });
    });

    describe('build', () => {
        it('creates a new value on each execution of build()', () => {
            const builder = createBuilder(initialTransformation);

            const value1 = builder.build();
            const value2 = builder.build();

            expect(value1).toEqual(value2);
            expect(value1).not.toBe(value2);
        });

        it('executes the transformations only on execution of build()', () => {
            const mockInitializer = jest.fn().mockImplementation(initialTransformation);

            const builder = createBuilder(mockInitializer);

            expect(mockInitializer).not.toHaveBeenCalled();

            // tslint:disable-next-line: no-inferred-empty-object-type
            builder.build();

            expect(mockInitializer).toHaveBeenCalled();
        });
    });

    describe('buildMany', () => {
        const size = 3;

        it('executes build() as often as specified, returning an array of generated values', () => {
            const builder = createBuilder(initialTransformation)
                .transform(transformation);

            const values: Value[] = builder.buildMany(size);

            expect(isArray(values)).toBe(true);
            expect(values.length).toBe(size);

            values.forEach(value => {
                expect(value).toEqual(transformedValue);
            });
        });

        it('executes the transformations for each iteration', () => {
            const mockInitializer = jest.fn().mockImplementation(initialTransformation);

            createBuilder(mockInitializer)
                .buildMany(size);

            expect(mockInitializer).toHaveBeenCalledTimes(size);
        });
    });

    describe('transform', () => {
        it('adds a transformation function to the builder', () => {
            const builder = createBuilder(initialTransformation);

            const value = builder
                .transform(transformation)
                .build();

            expect(value).toEqual(transformedValue);
        });
    });

});
