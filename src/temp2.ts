import { flow } from 'lodash';

// tslint:disable:no-invalid-this

type Transformation<CVT, RVT> = (value: CVT) => RVT;

type AddTransformation<CVT, RVT = CVT> = (transformation: Transformation<CVT, RVT>) => void;

type BuilderPluginMethods<BP> = {
    [M in keyof BP]: BP[M] extends (...args: infer R) => any ? (...args: R) => BuilderPluginMethods<BP> : (...args: any[]) => BuilderPluginMethods<BP>
};

type BuilderPlugin<CVT = any, RVT = any> = (addTransformation: AddTransformation<CVT, RVT>) => BuilderPluginMethods<ReturnType<BuilderPlugin<CVT, RVT>>>;

interface Builder<T> {
    addPlugin<CVT, RVT, BP extends BuilderPlugin<CVT, RVT>>(plugin: BP & BuilderPlugin<CVT, RVT>): ReturnType<BP> & Builder<T & RVT> & this;
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

/* ---------- */

const resourceBuilderPlugin = (addTransformation: AddTransformation<any, Resource>) => ({
    toResource(id: string) {
        addTransformation(currentValue => ({
            ...currentValue,
            _id: id
        }));
        return this;
    }
});

const productBuilderPlugin = (addTransformation: AddTransformation<any, Product>) => ({
    toProduct() {
        addTransformation(currentValue => ({
            ...currentValue,
            name: 'name',
            price: 1.23
        }));
        return this;
    }
});

const builder: BuilderFactory = (initialValue = {}) => {
    let transformations: Transformation<any, any>[] = [];

    const addTransformation = (transformationFn: Transformation<any, any>) => {
        transformations = [
            ...transformations,
            transformationFn
        ];
    };

    return {
        addPlugin<CVT, RVT>(plugin: BuilderPlugin<CVT, RVT>) {
            return <any> {
                ...this,
                ...plugin(addTransformation)
            };
        },
        build() {
            return flow(transformations)(initialValue);
        }
    };
};

const productBuilder = builder()
    .addPlugin(resourceBuilderPlugin)
    .addPlugin(productBuilderPlugin);

const product = productBuilder.build();
