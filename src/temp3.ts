// tslint:disable:no-invalid-this

type Transformation<CVT, RVT> = (value: CVT) => RVT;

type AddTransformation<CVT, RVT = CVT> = (transformation: Transformation<CVT, RVT>) => void;

abstract class BuilderPlugin<CVT, RVT> {
    constructor(
        protected addTransformation: AddTransformation<CVT, RVT>
    ) {}
}

type BuilderPluginConstructor<CVT, RVT> = (addTransformation: AddTransformation<CVT, RVT>) => BuilderPlugin<CVT, RVT>;

interface Builder<T = {}> {
    addPlugin<CVT, RVT, BPC extends BuilderPluginConstructor<CVT, RVT>>(plugin: BPC & BuilderPluginConstructor<CVT, RVT>): Builder<T & RVT> & ReturnType<BPC> & this;
    build(): T;
}

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

class ProductBuilderPlugin extends BuilderPlugin<any, Product> {
    name(name: string) {
        this.addTransformation(currentValue => ({
            ...currentValue,
            name
        }));
        return this;
    }
    price(price: number) {
        this.addTransformation(currentValue => ({
            ...currentValue,
            price
        }));
        return this;
    }
}

//#endregion

const builder: BuilderFactory = (initialValue = {}) => {
    let transformations: Transformation<any, any>[] = [];

    const addTransformation = (transformationFn: Transformation<any, any>) => {
        transformations = [
            ...transformations,
            transformationFn
        ];
    };

    return {
        addPlugin<CVT, RVT>(pluginConstructor: BuilderPluginConstructor<CVT, RVT>): any {
            const newThis = {
                ...this
            };

            const plugin = pluginConstructor(addTransformation);
            // tslint:disable-next-line:forin
            for (const method in plugin) {
                (<any> newThis)[method] = (<any> plugin)[method];
            }

            return newThis;
        },
        build() {
            return transformations.reduce(
                (value, transformation) => transformation(value),
                initialValue
            );
        }
    };
};

const productBuilder = builder()
    .addPlugin((addTransformation: AddTransformation<any, Resource>) => new ResourceBuilderPlugin(addTransformation))
    .addPlugin((addTransformation: AddTransformation<any, Product>) => new ProductBuilderPlugin(addTransformation))
    .name('Orange Juice')
    .price(1.2)
    .toResource('product-1');

const productResource = productBuilder.build();

console.log(productResource);
