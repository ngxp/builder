// tslint:disable:no-invalid-this
import { cloneDeep, flow, forOwn, isObject, times } from 'lodash-es';

export interface Builder<T> {
    transform(transformation: Transformation<T>): this;
    freeze(): this;
    build(): T;
    buildMany(size: number): T[];
}

export type Transformation<T> = (value: Partial<T>) => Partial<T>;

export function createBuilder<T>(initialTransformation: Transformation<T> | Transformation<T>[]): Builder<T> {
    const initialTransformations: Transformation<T>[] = isArray(initialTransformation) ? initialTransformation : [initialTransformation];

    let transformations: Transformation<T>[] = [
        ...initialTransformations
    ];

    return {
        transform(transformation: Transformation<T>) {
            transformations = [
                ...transformations,
                transformation
            ];
            return this;
        },
        freeze() {
            this.transform(
                (currentValue: Partial<T>) => deepFreeze(cloneDeep(currentValue))
            );
            return this;
        },
        build() {
            return <T> flow(transformations)({});
        },
        buildMany(size: number) {
            return times(size, () => this.build());
        }
    };
}

function deepFreeze<T>(obj: T): T {
    Object.freeze(obj);
    forOwn(
        obj,
        value => {
            if (isObject(value) && !Object.isFrozen(value)) {
                deepFreeze(value);
            }
        }
    );

    return obj;
}
