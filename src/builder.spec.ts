import { clone, isArray } from 'lodash-es';
import { createBuilder, Transformation } from './builder';

describe('createBuilder', () => {
    interface NestedValue {
        baz: number;
    }

    interface ExtendedNestedValue extends NestedValue {
        qux: undefined;
    }

    interface Value<T = NestedValue> {
        foo: string;
        bar: T;
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

        it('allows overriding the return type by providing a type variable', () => {
            const builder = createBuilder(initialTransformation);

            const value = builder
                .build<Value<ExtendedNestedValue>>();

            expect(value.bar.qux).toBeUndefined();
        });
    });

    describe('buildMany', () => {
        const size = 3;

        it('executes build() as often as specified, returning an array of generated values', () => {
            const builder = createBuilder(initialTransformation)
                .transform(transformation);

            const values = builder.buildMany(size);

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

        it('allows overriding the return type by providing a type variable', () => {
            const builder = createBuilder(initialTransformation);

            const values = builder
                .buildMany<Value<ExtendedNestedValue>>(1);

            expect(values[0].bar.qux).toBeUndefined();
        });
    });

    describe('transform', () => {
        it('returns a new builder instance with an additional transformation', () => {
            const builder = createBuilder(initialTransformation);
            const updatedBuilder = builder
                .transform(transformation);

            const value = updatedBuilder.build();

            expect(value).toEqual(transformedValue);
            expect(builder).not.toBe(updatedBuilder);
        });
    });

});
