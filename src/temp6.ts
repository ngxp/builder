// tslint:disable:no-magic-numbers no-console

export interface Resource {
    _id: string;
}

interface Product {
    name: string;
    price: number;
}

type Blueprint<T> = {
    [P in keyof T]: () => T[P]
};

type BlueprintBuilderMethod<V> = (value: V) => this;

type BlueprintBuilderMethods<T> = {
    [P in keyof T]: BlueprintBuilderMethod<T[P]>;
};

abstract class BuilderPlugin<CVT, RVT> {
    constructor(
        protected addTransformation: AddTransformation<CVT, RVT>
    ) {}
}

declare class ResourceBuilderPlugin extends BuilderPlugin<any, Resource> {
    toResource(id: string): this;
}

declare const productBlueprint: Blueprint<Product>;

type Transformation<CVT, RVT> = (value: CVT) => RVT;

type AddTransformation<CVT, RVT = CVT> = (transformation: Transformation<CVT, RVT>) => void;

interface Builder<T = void> {
    addPlugin<CVT, RVT, BPC extends BuilderPluginConstructor<CVT, RVT>>(plugin: BPC & BuilderPluginConstructor<CVT, RVT>): Builder<T & RVT> & ReturnType<BPC> & this;
    addBlueprint<BPT>(blueprint: Blueprint<BPT>): Builder<T & BPT> & BlueprintBuilderMethods<BPT> & this;
    build(): T;
}

type BuilderPluginConstructor<CVT, RVT> = (addTransformation: AddTransformation<CVT, RVT>) => BuilderPlugin<CVT, RVT>;

declare const builder: Builder;

const productResource = builder
    .addPlugin((addTransformation: AddTransformation<any, Resource>) => new ResourceBuilderPlugin(addTransformation))
    .addBlueprint(productBlueprint)
    .name('Orange Juice')
    .price(1.2)
    .toResource('product-1')
    .build();

console.log(productResource);
