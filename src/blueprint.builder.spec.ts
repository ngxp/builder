import { commerce, random } from 'faker';
import { isNumber, isString, multiply } from 'lodash-es';
import { Blueprint, BlueprintFactory, createBlueprintBuilder } from './blueprint.builder';
import { Transformation } from './builder';

describe('createBlueprintBuilder', () => {
    interface Product {
        name: string;
        price: number;
        rating?: number;
    }

    const productBlueprint: Blueprint<Product> = {
        name: () => commerce.productName(),
        price: () => random.number({ min: 0.01, max: 99.99, precision: 0.01 }),
        rating: () => random.number({ min: 1, max: 5 })
    };

    const productBlueprintFn: BlueprintFactory<Product> = () => productBlueprint;

    const multiplicand = 2;
    const makeExpensive: Transformation<Product> = product => ({
        ...product,
        price: multiply(product.price!, multiplicand)
    });

    const altName = commerce.productName();
    const altPrice = random.number({ min: 0.01, max: 99.99, precision: 0.01 });
    const betterAltPrice = multiply(altPrice, multiplicand);
    const altRating = random.number({ min: 1, max: 5 });


    it('returns a builder that uses the given blueprint to create a new value', () => {
        const productBuilder = createBlueprintBuilder(productBlueprint);

        const product = productBuilder().build();

        expect(isString(product.name)).toBe(true);
        expect(isNumber(product.price)).toBe(true);
    });

    it('accepts a function that returns a blueprint instead of the blueprint itself', () => {
        const productBuilder = createBlueprintBuilder(productBlueprintFn);

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
            const productBuilder = createBlueprintBuilder(productBlueprint);

            const product = productBuilder()
                .name(altName)
                .price(altPrice)
                .rating(altRating)
                .build();

            expect(product.name).toBe(altName);
            expect(product.price).toBe(altPrice);
        });

        it('sets the values before any transformations are applied', () => {
            const productBuilder = createBlueprintBuilder(productBlueprint);

            const product = productBuilder()
                .transform(makeExpensive)
                .price(altPrice)
                .build();

            expect(product.price).toBe(betterAltPrice);
        });

        it('returns a new blueprint builder instance for each overwritten value', () => {
            const productBuilder = createBlueprintBuilder(productBlueprint)()
                .price(altPrice);
            const betterProductBuilder = productBuilder
                .price(betterAltPrice);

            const product = productBuilder.build();
            const betterProduct = betterProductBuilder.build();

            expect(productBuilder).not.toBe(betterProductBuilder);
            expect(product.price).not.toEqual(betterProduct.price);
        });
    });

    describe('transform', () => {
        it('returns a new blueprint builder instance for each additional transformation', () => {
            const productBuilder = createBlueprintBuilder(productBlueprint)()
                .price(altPrice);

            const betterProductBuilder = productBuilder
                .transform(makeExpensive);

            const product = productBuilder.build();
            const betterProduct = betterProductBuilder.build();

            expect(productBuilder).not.toBe(betterProductBuilder);
            expect(product.price).not.toEqual(betterProduct.price);
        });
    });
});
