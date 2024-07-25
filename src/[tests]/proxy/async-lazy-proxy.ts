import { describe, expect, jest, test } from "@jest/globals";
import { ProxyOperationNotSupportedError } from "@svs-tm/system/types/reflection/proxy";
import { AsyncLazyProxy } from "proxy/async-lazy-proxy";
import { AsyncLazyProxyInitError } from "proxy/errors/async-lazy-proxy-init-error";
import { AsyncLazyProxyTypeError } from "proxy/errors/async-lazy-proxy-type-error";

describe
(
    "AsyncLazyProxy",
    () =>
    {
        test
        (
            "Method 'create' must throw AsyncLazyProxyInitError for empty factory",
            () =>
            {
                expect(() => AsyncLazyProxy.create(undefined as unknown as AsyncLazyProxy.Factory<object>)).toThrowError(AsyncLazyProxyInitError);
                expect(() => AsyncLazyProxy.create(null as unknown as AsyncLazyProxy.Factory<object>)).toThrowError(AsyncLazyProxyInitError);
            }
        );

        test
        (
            "Method 'isInstanceOf' must return true for created proxy, and false for original object", 
            () =>
            {
                const originalObject = {};

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(AsyncLazyProxy.isInstanceOf(lazy)).toBe(true);
                expect(AsyncLazyProxy.isInstanceOf(originalObject)).toBe(false);
            }
        );

        test
        (
            "Method 'isInitialized' must throw AsyncLazyProxyTypeError for non AsyncLazyProxy objects, and not throw for AsyncLazyProxy objects", 
            () =>
            {
                const originalObject = {};

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => AsyncLazyProxy.isInitialized(lazy)).not.toThrowError();
                expect(() => AsyncLazyProxy.isInitialized(originalObject)).toThrowError(AsyncLazyProxyTypeError);
            }
        );

        test
        (
            "Apply must be reflected in original object", 
            async () =>
            {
                const mock = jest.fn((...parameters: any[]) => {});
                const originalObject = (...parameters: any[]) => 
                {
                    mock(...parameters);
                };

                const parameters = [1, "2", false, {}, []];

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forFunction(() => originalObject));
                
                await lazy(...parameters);

                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(...parameters);
            }
        );

        test
        (
            "Construct must be reflected in original object", 
            async () =>
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

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forClass(() => originalObject));

                await new lazy(...parameters);

                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(...parameters);
            }
        );

        test
        (
            "Define property must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const originalObject = {};
                const propertyName = "property1";

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => Object.defineProperty(lazy, propertyName, {})).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Delete property must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true } as { [propertyName]?: true };

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => delete (lazy as any)[propertyName]).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Get property must return value from original object's property", 
            async () =>
            {
                const propertyName = "property1";
                const propertyValue = {};
                const originalObject = { [propertyName]: propertyValue };

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(await lazy[propertyName]()).toBe(originalObject[propertyName]);
            }
        );

        test
        (
            "Method Object.getOwnPropertyDescriptor must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true };

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => Object.getOwnPropertyDescriptor(lazy, propertyName))
                    .toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Method Object.getPrototypeOf must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const originalObject = Object.create({});

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => Object.getPrototypeOf(lazy)).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Operator 'in' must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true };

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => propertyName in lazy).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Method Object.isExtensible must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const originalObject = Object.preventExtensions({});

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => Object.isExtensible(lazy)).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Method Reflect.ownKeys must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const propertyName = "property1";
                const originalObject = { [propertyName]: true };

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));
                
                expect(() => Reflect.ownKeys(lazy)).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Method Object.preventExtensions must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const originalObject = {};
                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => Object.preventExtensions(lazy)).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Operator Set must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const propertyName = "property1";
                const propertyValue = true as boolean;
                const originalObject: { [key: string]: typeof propertyValue } = {};

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => (lazy as any)[propertyName] = propertyValue).toThrowError(ProxyOperationNotSupportedError);
            }
        );

        test
        (
            "Method Object.setPrototypeOf must throw ProxyOperationNotSupportedError", 
            () =>
            {
                const originalObject = {};
                const prototype = {};

                const lazy = AsyncLazyProxy.create(AsyncLazyProxy.Factory.forObject(() => originalObject));

                expect(() => Object.setPrototypeOf(lazy, prototype)).toThrowError(ProxyOperationNotSupportedError);
            }
        );
    }
);
