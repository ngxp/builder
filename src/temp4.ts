import { commerce, random } from 'faker';
import { flow, isUndefined, mapValues } from 'lodash';

// tslint:disable:no-invalid-this

type Transformation<CVT, RVT> = (value: CVT) => RVT;

type AddTransformation<CVT, RVT = CVT> = (transformation: Transformation<CVT, RVT>) => void;

abstract class BuilderPlugin<CVT, RVT> {
    constructor(
        protected addTransformation: AddTransformation<CVT, RVT>
    ) { }
}

type BuilderPluginConstructor<CVT, RVT> = (addTransformation: AddTransformation<CVT, RVT>) => BuilderPlugin<CVT, RVT>;
type BuilderPluginFactory<CVT, RVT> = (addTransformation: AddTransformation<CVT, RVT>) => BuilderPlugin<CVT, RVT>;

type BuilderFactory<T = {}> = (initialValue?: T) => Builder<T>;

/* ---------- */

export interface Resource {
    _id: string;
}

interface Product {
    name: string;
    price: number;
}

//#region Builder Plugins

class ResourceBuilderPlugin extends BuilderPlugin<any, Resource> {
    toResource(id: string) {
        this.addTransformation(currentValue => ({
            ...currentValue,
            _id: id
        }));
        return this;
    }
}

// class ProductBuilderPlugin extends BuilderPlugin<any, Product> {
//     toProduct() {
//         this.addTransformation(currentValue => ({
//             ...currentValue,
//             name: 'name',
//             price: 1.23
//         }));
//         return this;
//     }
//     toExpensiveProduct() {
//         this.addTransformation(currentValue => ({
//             ...currentValue,
//             name: 'name',
//             price: 1.23
//         }));
//         return this;
//     }
// }

//#endregion


type Blueprint<T> = {
    [P in keyof T]: () => T[P]
};

type BlueprintFactory<T> = () => Blueprint<T>;

type BlueprintBuilderMethod<V, R> = (value: V) => R;
// x type BlueprintBuilderMethod<V, T> = (value: V) => BlueprintBuilderMethods<T>;

type BlueprintBuilderMethods<T, R> = {
    [P in keyof T]: BlueprintBuilderMethod<T[P], R>;
};

interface Product {
    name: string;
    price: number;
}

const productBlueprint: Blueprint<Product> = {
    name: () => commerce.productName(),
    price: () => random.number({ min: 0.01, max: 99.99, precision: 0.01 })
};

function generateBlueprintBuilderMethods<R, T>(blueprint: Blueprint<T>): BlueprintBuilderMethods<T, R> {
    return {
        ...<any> mapValues(
            blueprint,
            (blueprintFn, prop: keyof T) => generateBlueprintBuilderMethod<R, keyof T, T>(prop)
        )
    };
}

function generateBlueprintBuilderMethod<R, CVT, T>(prop: keyof T): BlueprintBuilderMethod<T[keyof T], R> {
    return function (this: BuilderPlugin<CVT, T> & BlueprintBuilderMethods<T>, value: T[keyof T]) {
        (<any> this).addTransformation((currentValue: CVT) => ({
            ...<any> currentValue,
            [prop]: value
        }));
        return this;
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

interface Constructor<T> {
    new (...args: any[]): T & BuilderPlugin<any, any & T>;
}

// tslint:disable-next-line:variable-name only-arrow-functions
const ProductBuilderPluginFactory: Constructor<BlueprintBuilderMethods<Product, R>> = <any> function () {
    return generateBlueprintBuilderMethods<any, Product>(productBlueprint);
};


const builder: BuilderFactory = (initialValue = {}) => {
    let transformations: Transformation<any, any>[] = [];

    const addTransformation = (transformationFn: Transformation<any, any>) => {
        transformations = [
            ...transformations,
            transformationFn
        ];
    };

    return {
        addPlugin2<T, R>(builderPlugin: (addTransformation: AddTransformation<any, any>, returnValue: BlueprintBuilderMethods<T, R>) => BlueprintBuilderMethods<T, R>) {
            const newThis = {
                ...this
            };

            const plugin = builderPlugin(addTransformation, <any> newThis);
            // tslint:disable-next-line:forin
            for (const method in plugin) {
                (<any> newThis)[method] = (<any> plugin)[method];
            }

            return <any> newThis;
        },
        addPlugin<CVT, RVT>(pluginConstructor: BuilderPluginConstructor<CVT, RVT>) {
            const newThis = {
                ...this
            };

            const plugin = pluginConstructor(addTransformation);
            // tslint:disable-next-line:forin
            for (const method in plugin) {
                (<any> newThis)[method] = (<any> plugin)[method];
            }

            return <any> newThis;
        },
        build() {
            return flow(transformations)(initialValue);
        }
    };
};

interface Builder<T = number> {
    addPlugin<CVT, RVT, BPC extends BuilderPluginConstructor<CVT, RVT>>(plugin: BPC & BuilderPluginConstructor<CVT, RVT> | BuilderPluginFactory<CVT, RVT>): Builder<T & RVT> & ReturnType<BPC> & this;
    build(): T;
}

const productBuilder = builder()
    .addPlugin((addTransformation: AddTransformation<any, Resource>) => new ResourceBuilderPlugin(addTransformation))
    .addPlugin((addTransformation: AddTransformation<any, Product>) => new ProductBuilderPluginFactory(addTransformation))
    .price(1)
    .toResource('id');

const product = productBuilder.build();

console.log(product);
