// tslint:disable:no-magic-numbers no-console

export interface Resource {
    _id: string;
}

interface Product {
    name: string;
    price: number;
}

abstract class BuilderPlugin<CVT, RVT> {
    constructor(
        protected addTransformation: AddTransformation<CVT, RVT>
    ) {}
}

declare class ResourceBuilderPlugin extends BuilderPlugin<any, Resource> {
    toResource(id: string): this;
}

declare class ProductBuilderPlugin extends BuilderPlugin<any, Product> {
    name(name: string): this;
    price(price: number): this;
}

type Transformation<CVT, RVT> = (value: CVT) => RVT;

type AddTransformation<CVT, RVT = CVT> = (transformation: Transformation<CVT, RVT>) => void;

interface Builder<T = void> {
    addPlugin<CVT, RVT, BPC extends BuilderPluginConstructor<CVT, RVT>>(plugin: BPC & BuilderPluginConstructor<CVT, RVT>): Builder<T & RVT> & ReturnType<BPC> & this;
    build(): T;
}

type BuilderPluginConstructor<CVT, RVT> = (addTransformation: AddTransformation<CVT, RVT>) => BuilderPlugin<CVT, RVT>;

declare const builder: Builder;

const productResource = builder
    .addPlugin((addTransformation: AddTransformation<any, Resource>) => new ResourceBuilderPlugin(addTransformation))
    .addPlugin((addTransformation: AddTransformation<any, Product>) => new ProductBuilderPlugin(addTransformation))
    .name('Orange Juice')
    .price(1.2)
    .toResource('product-1')
    .build();

console.log(productResource);
