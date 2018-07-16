// tslint:disable:no-invalid-this
import { flow, times } from 'lodash-es';

export interface Builder<T> {
    transform(transformation: Transformation<T>): this;
    build(): T;
    buildMany(size: number): T[];
}

export type Transformation<T> = (value: T) => T;

export function createBuilder<T>(initializer: Transformation<T>): Builder<T> {
    let transformations: Transformation<T>[] = [
        initializer
    ];

    return {
        transform(transformation: Transformation<T>) {
            transformations = [
                ...transformations,
                transformation
            ];
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
