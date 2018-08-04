import { isFunction, isUndefined, mapValues } from 'lodash-es';
import { Builder, createBuilder } from './builder';

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
        return {
        ...createBuilder(() => fromBlueprint(blueprint, values)),
        ...<any> generateBlueprintBuilderMethods(blueprint)
        };
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

function generateBlueprintBuilderMethods<T>(blueprint: Blueprint<T>): BlueprintBuilderMethods<T> {
    return <any> mapValues(
        blueprint,
        (blueprintFn, prop) => generateBlueprintBuilderMethod(prop)
    );
}

function generateBlueprintBuilderMethod<T>(prop: keyof T): BlueprintBuilderMethod<T[keyof T], T> {
    return function (this: BlueprintBuilder<T>, value: T[keyof T]) {
        return this.transform((currentValue: T) => ({
            ...<any> currentValue,
            [prop]: value
        }));
    };
}
