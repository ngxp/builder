// tslint:disable:no-invalid-this
import { cloneDeep, flow, forOwn, isArray, isObject, times } from 'lodash-es';

export interface Builder<T> {
    transform(transformation: Transformation<T>): this;
    freeze(): this;
    build<R = T>(): R;
    buildMany<R = T>(size: number): R[];
}

export type Transformation<T> = (value: Partial<T>) => Partial<T>;

export function createBuilder<T>(initialTransformation: Transformation<T> | Transformation<T>[]): Builder<T> {
    const transformations: Transformation<T>[] = isArray(initialTransformation) ? initialTransformation : [initialTransformation];

    return {
        transform(transformation: Transformation<T>) {
            return createBuilder([
                ...transformations,
                transformation
            ]);
        },
        freeze() {
            return this.transform(
                (currentValue: Partial<T>) => deepFreeze(cloneDeep(currentValue))
            );
        },
        build<R = T>() {
            return <R> flow(transformations)({});
        },
        buildMany<R = T>(size: number) {
            return times(size, () => this.build<R>());
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
