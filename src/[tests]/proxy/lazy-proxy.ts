import { describe, expect, jest, test } from "@jest/globals";
import { LazyProxyInitError } from "proxy/errors/lazy-proxy-init-error";
import { LazyProxyTypeError } from "proxy/errors/lazy-proxy-type-error";
import { LazyProxy } from "proxy/lazy-proxy";

describe
(
    "LazyProxy", 
    () =>
    {
        test
        (
            "Method 'create' must throw for empty factory", 
            () =>
            {
                expect(() => LazyProxy.create(undefined as unknown as LazyProxy.Factory<object>)).toThrowError(LazyProxyInitError);
                expect(() => LazyProxy.create(null as unknown as LazyProxy.Factory<object>)).toThrowError(LazyProxyInitError);
            }
        );

        test
        (
            "Method 'isInstanceOf' must return true for created proxy, and false for original object", 
            () =>
            {
                const originalObject = {};

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(LazyProxy.isInstanceOf(lazy)).toBe(true);
                expect(LazyProxy.isInstanceOf(originalObject)).toBe(false);
            }
        );

        test
        (
            "Method 'isInitialized' must throw for non LazyProxy objects, and not throw for LazyProxy objects", 
            () =>
            {
                const originalObject = {};

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(() => LazyProxy.isInitialized(lazy)).not.toThrowError();
                expect(() => LazyProxy.isInitialized(originalObject)).toThrowError(LazyProxyTypeError);
            }
        );

        test
        (
            "Apply must be reflected in original object", 
            () =>
            {
                const mock = jest.fn((...parameters: any[]) => {});
                const originalObject = (...parameters: any[]) => 
                {
                    mock(...parameters);
                };

                const parameters = [1, "2", false, {}, []];

                const lazy = LazyProxy.create(LazyProxy.Factory.forFunction(() => originalObject));

                lazy(...parameters);

                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(...parameters);
            }
        );

        test
        (
            "Construct must be reflected in original object", 
            () =>
            {
                const mock = jest.fn((...parameters: any[]) => {});

                const originalObject = class
                {
                    public constructor(...parameters: any[])
                    {
                        mock(...parameters);
                    }
                };
                
                const parameters = [1, "2", false, {}, []];

                const lazy = LazyProxy.create(LazyProxy.Factory.forClass(() => originalObject));

                new lazy(...parameters);

                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(...parameters);
            }
        );

        test
        (
            "Define property must be reflected in original object", 
            () =>
            {
                const originalObject = {};
                const propertyName = "property1";

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                Object.defineProperty(lazy, propertyName, {});

                expect(originalObject).toHaveProperty(propertyName);
            }
        );

        test
        (
            "Delete property must be reflected in original object", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true } as { [propertyName]?: true };

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                delete lazy[propertyName];

                expect(originalObject).not.toHaveProperty(propertyName);
            }
        );

        test
        (
            "Get property must return value from original object's property", 
            () =>
            {
                const propertyName = "property1";
                const propertyValue = {};
                const originalObject = { [propertyName]: propertyValue };

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(lazy[propertyName]).toBe(originalObject[propertyName]);
            }
        );

        test
        (
            "Method Object.getOwnPropertyDescriptor must return value from original object", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true };

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(Object.getOwnPropertyDescriptor(lazy, propertyName))
                    .toStrictEqual(Object.getOwnPropertyDescriptor(originalObject, propertyName));
            }
        );

        test
        (
            "Method Object.getPrototypeOf must return value from original object", 
            () =>
            {
                const originalObject = Object.create({});

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(Object.getPrototypeOf(lazy)).toBe(Object.getPrototypeOf(originalObject));
            }
        );

        test
        (
            "Operator 'in' must return true for property from original object", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true };

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(propertyName in lazy).toBe(true);
            }
        );

        test
        (
            "Method Object.isExtensible must return false, as in original object", 
            () =>
            {
                const originalObject = Object.preventExtensions({});

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                expect(Object.isExtensible(lazy)).toBe(Object.isExtensible(originalObject));
                expect(Object.isExtensible(lazy)).toBe(false);
            }
        );

        test
        (
            "Method Reflect.ownKeys must return the same value as in original object", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true };

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));
                
                expect(Reflect.ownKeys(lazy)).toStrictEqual(Reflect.ownKeys(originalObject));
            }
        );

        test
        (
            "Method Object.preventExtensions must be reflected in original object", 
            () =>
            {
                const propertyName = "property1";
                const originalObject: { [key: string]: true } = {};

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                Object.preventExtensions(lazy);

                expect(() => lazy[propertyName] = true).toThrow();
                expect(lazy).not.toHaveProperty(propertyName);
                expect(originalObject).not.toHaveProperty(propertyName);
                expect(Object.isExtensible(originalObject)).toBe(false);
            }
        );

        test
        (
            "Operator Set must must be reflected in original object", 
            () =>
            {
                const propertyName = "property1";
                const propertyValue = true as boolean;
                const originalObject: { [key: string]: typeof propertyValue } = {};

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                lazy[propertyName] = propertyValue;

                expect(lazy).toHaveProperty(propertyName, propertyValue)
                expect(originalObject).toHaveProperty(propertyName, propertyValue);
            }
        );

        test
        (
            "Method Object.setPrototypeOf must must be reflected in original object", 
            () =>
            {
                const originalObject = {};
                const prototype = {};

                const lazy = LazyProxy.create(LazyProxy.Factory.forObject(() => originalObject));

                Object.setPrototypeOf(lazy, prototype);

                expect(Object.getPrototypeOf(originalObject)).toBe(prototype);
            }
        );
    }
);
