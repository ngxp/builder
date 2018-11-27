import { commerce, random } from 'faker';
import { flow, isFunction, isUndefined, mapValues } from 'lodash';

// tslint:disable:no-invalid-this

type Transformation<T> = (value: T) => T;
type AddTransformation<T = any> = (transformation: Transformation<T>) => void;

const resourceBuilder = (addTransformation: AddTransformation) => {
    return {
        toResource(id: string) {
            addTransformation(
                (currentValue: any) => ({
                    ...currentValue,
                    id
                })
            );
            return this;
        }
    };
};

function createBlueprintBuilder<T>(blueprintFn: Blueprint<T> | BlueprintFactory<T>): (addTransformation: AddTransformation) => BlueprintBuilderMethods<T> {
    const blueprint = isFunction(blueprintFn) ? blueprintFn() : blueprintFn;
    return (addTransformation: AddTransformation) => generateBlueprintBuilderMethods(blueprint, addTransformation);
}

interface Product {
    name: string;
    price: number;
}

const productBlueprint: Blueprint<Product> = {
    name: () => commerce.productName(),
    price: () => random.number({ min: 0.01, max: 99.99, precision: 0.01 })
};

const productBuilder = createBlueprintBuilder(productBlueprint);

type BuilderFactory<BT> = (addTransformation: AddTransformation) => Builder<BT>;

type Builder<T> = { build(): any } & {
    [P in keyof T]: T[P] extends (...args: infer R) => any ? (...args: R) => Builder<T> : () => Builder<T>
};


function combineBuilders<BT1, B1 extends BuilderFactory<BT1>, BT2, B2 extends BuilderFactory<BT2>>(builder1: B1, builder2: B2): Builder<ReturnType<B1> & ReturnType<B2>> {
    let transformations: Transformation<any>[] = [];

    const addTransformation = (transformationFn: Transformation<any>) => {
        transformations = [
            ...transformations,
            transformationFn
        ];
    };

    return {
        ...<any> builder1(addTransformation),
        ...<any> builder2(addTransformation),
        build() {
            return flow(transformations)({});
        }
    };
}

const builder = combineBuilders(
    productBuilder,
    resourceBuilder
);

console.log(builder
    .fake()
    .name('Cars')
    .toResource('id')
    .build());



type Blueprint<T> = {
    [P in keyof T]: () => T[P]
};

type BlueprintFactory<T> = () => Blueprint<T>;

type BlueprintBuilderMethod<V, T> = (value: V) => BlueprintBuilderMethods<T>;

type BlueprintBuilderMethods<T> = { fake(): void } & {
    [P in keyof T]: BlueprintBuilderMethod<T[P], T>;
};

function fromBlueprint<T>(blueprint: Blueprint<T>, values?: Partial<T>): T {
    return {
        ...<any> mapValues<Blueprint<T>, any>(
            blueprint,
            fn => fn()
        ),
        ...<any> (isUndefined(values) ? {} : values)
    };
}

function generateBlueprintBuilderMethods<T>(blueprint: Blueprint<T>, addTransformation: AddTransformation): BlueprintBuilderMethods<T> {
    return {
        fake() {
            addTransformation(() => fromBlueprint(blueprint));
            return this;
        },
        ...<any> mapValues(
            blueprint,
            (blueprintFn, prop) => generateBlueprintBuilderMethod(prop, addTransformation)
        )
    };
}

function generateBlueprintBuilderMethod<T>(prop: keyof T, addTransformation: AddTransformation): BlueprintBuilderMethod<T[keyof T], T> {
    return function (this: BlueprintBuilderMethods<T>, value: T[keyof T]) {
        addTransformation((currentValue: T) => ({
            ...<any> currentValue,
            [prop]: value
        }));
        return this;
    };
}
