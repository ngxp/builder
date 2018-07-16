import { commerce, random } from 'faker';
import { isNumber, isString } from 'lodash-es';
import { Blueprint, createBlueprintBuilder } from './blueprint.builder';

describe('createBlueprintBuilder', () => {
    interface Product {
        name: string;
        price: number;
    }

    const productBlueprint: Blueprint<Product> = {
        name: () => commerce.productName(),
        price: () => random.number({ min: 0.01, max: 99.99, precision: 0.01 })
    };

    it('returns a builder that uses the given blueprint to create a new value', () => {
        const productBuilder = createBlueprintBuilder(productBlueprint);

        const product = productBuilder().build();

        expect(isString(product.name)).toBe(true);
        expect(isNumber(product.price)).toBe(true);
    });

    it('executes the blueprint on each execution of build()', () => {
        const productBuilder = createBlueprintBuilder(productBlueprint);

        const product1 = productBuilder().build();
        const product2 = productBuilder().build();

        expect(product1).not.toEqual(product2);
    });

    it('returns a builder that accepts fixed values that overwrite the blueprint', () => {
        const productName = commerce.productName();
        const productBuilder = createBlueprintBuilder(productBlueprint);

        const product = productBuilder({ name: productName }).build();

        expect(product.name).toBe(productName);
        expect(isNumber(product.price)).toBe(true);
    });

    describe('blueprint builder methods', () => {
        it('provides a method for each property of the blueprint that overwrites the blueprint-generated value', () => {
            const name = productBlueprint.name();
            const price = productBlueprint.price();
            const productBuilder = createBlueprintBuilder(productBlueprint);

            const product = productBuilder()
                .name(name)
                .price(price)
                .build();

            expect(product.name).toBe(name);
            expect(product.price).toBe(price);
        });
    });
});
