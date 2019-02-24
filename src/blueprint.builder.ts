import { isFunction, isUndefined, mapValues } from 'lodash-es';
import { Builder, createBuilder, Transformation } from './builder';

export type Blueprint<T> = {
    [P in keyof T]: () => T[P]
};

export type BlueprintFactory<T> = () => Blueprint<T>;

export type BlueprintBuilder<T> = Builder<T> & BlueprintBuilderMethods<T>;

export type BlueprintBuilderMethod<V, T> = (value: V) => BlueprintBuilder<T>;

export type BlueprintBuilderMethods<T> = {
    [P in keyof T]: BlueprintBuilderMethod<T[P], T>;
};

export function createBlueprintBuilder<T>(blueprintFn: Blueprint<T> | BlueprintFactory<T>): (values?: Partial<T>) => BlueprintBuilder<T> {
    const blueprint = isFunction(blueprintFn) ? blueprintFn() : blueprintFn;

    return (values?: Partial<T>) => {
        return blueprintBuilderFactory(blueprint, [], values);
    };
}

function blueprintBuilderFactory<T>(
    blueprint: Blueprint<T>,
    transformations: Transformation<T>[] = [],
    valueOverrides?: Partial<T>
): BlueprintBuilder<T> {
    return {
        ...createBuilder([
            () => fromBlueprint(blueprint, valueOverrides),
            ...transformations
        ]),

        ...<any> generateBlueprintBuilderMethods(
            blueprint,
            transformations,
            valueOverrides
        ),

        transform(transformation: Transformation<T>) {
            return blueprintBuilderFactory(
                blueprint,
                [
                    ...transformations,
                    transformation
                ],
                valueOverrides
            );
        }
    };
}

function fromBlueprint<T>(blueprint: Blueprint<T>, values?: Partial<T>): T {
    return {
        ...<any> mapValues<Blueprint<T>, any>(
            blueprint,
            fn => fn()
        ),
        ...<any> (isUndefined(values) ? {} : values)
    };
}

function generateBlueprintBuilderMethods<T>(
    blueprint: Blueprint<T>,
    transformations: Transformation<T>[],
    valueOverrides: Partial<T> = {}
): BlueprintBuilderMethods<T> {
    return <any> mapValues(
        blueprint,
        (blueprintFn, prop) => function (value: T[keyof T]) {
            return blueprintBuilderFactory(
                blueprint,
                transformations,
                <any> {
                    ...valueOverrides,
                    [prop]: value
                }
            );
        }
    )
}
