import { isEmpty, isNotEmpty } from "@svs-tm/system/guards";
import { createSafeProxyHandler } from "@svs-tm/system/helpers/reflection/proxy";
import { Undefinable } from "@svs-tm/system/types";
import { Constructor, Delegate } from "@svs-tm/system/types/functions";
import { ProxyOperation, ProxyOperationNotSupportedError } from "@svs-tm/system/types/reflection/proxy";
import { Lazy } from "lazy";
import { LazyProxyInitError } from "proxy//errors/lazy-proxy-init-error";
import { LazyProxyTypeError } from "proxy//errors/lazy-proxy-type-error";
import { LazyProxyFactoryType } from "proxy/lazy-proxy-factory-type";

const lazyProxyMarker: unique symbol = Symbol("lazyProxyMarker");

type LazyProxyTaret =
{
    lazy: Lazy<any>;
};

const handler = createSafeProxyHandler<LazyProxyTaret>
(
    {
        apply: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.apply(value, ...others);
        },
        construct: (target, parameters, newTarget) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.construct(value, parameters, value);
        },
        defineProperty: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.defineProperty(value, ...others);
        },
        deleteProperty: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.deleteProperty(value, ...others);
        },
        get: (target, property, receiver) =>
        {
            if (property === lazyProxyMarker)
                return target.lazy;
    
            const value = target.lazy.getValue();
    
            return Reflect.get(value, property, receiver);
        },
        getOwnPropertyDescriptor: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.getOwnPropertyDescriptor(value, ...others);
        },
        getPrototypeOf: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.getPrototypeOf(value, ...others);
        },
        has: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.has(value, ...others);
        },
        isExtensible: (target) =>
        {
            const value = target.lazy.getValue();
    
            const result = Reflect.isExtensible(value);
    
            if (!result && Reflect.isExtensible(target))
                Reflect.preventExtensions(target);
    
            return result;
        },
        ownKeys: (target) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.ownKeys(value);
        },
        preventExtensions: (target) =>
        {
            const value = target.lazy.getValue();
    
            if (Reflect.preventExtensions(target))
            {
                if (Reflect.preventExtensions(value))
                    return true;
    
                /**@todo Custom error? */
                throw new ProxyOperationNotSupportedError(ProxyOperation.PREVENT_EXTENSIONS, [target]);
            }
    
            return false;
        },
        set: (target, property, newValue, receiver) =>
        {
            const value = target.lazy.getValue();
    
            if (!Object.isExtensible(value))
            {
                Object.preventExtensions(target);
    
                return false;
            }
    
            return Reflect.set(value, property, newValue, value);
        },
        setPrototypeOf: (target, ...others) =>
        {
            const value = target.lazy.getValue();
    
            return Reflect.setPrototypeOf(value, ...others);
        }
    }
);

export namespace LazyProxy
{
    function getLazy<T_Value extends object>(value: T_Value): Undefinable<Lazy<T_Value>>
    {
        return (value as any)?.[lazyProxyMarker] as Undefinable<Lazy<T_Value>>;
    }

    export class Factory<T_Type extends object>
    {
        private constructor
        (
            public readonly type: LazyProxyFactoryType,
            public readonly value: Delegate<[], T_Type>
        )
        {
        }

        public static forObject<T_Object extends {}>(factory: Delegate<[], T_Object>): Factory<T_Object>
        {
            return new Factory(LazyProxyFactoryType.Object, factory);
        }

        public static forClass<T_Class extends Constructor<any[], any>>(factory: Delegate<[], T_Class>): Factory<T_Class>
        {
            return new Factory(LazyProxyFactoryType.Class, factory);
        }

        public static forFunction<T_Function extends Delegate<any[], any>>(factory: Delegate<[], T_Function>): Factory<T_Function>
        {
            return new Factory(LazyProxyFactoryType.Function, factory);
        }
    }

    function createTarget(type: LazyProxyFactoryType, lazy: Lazy<any>): LazyProxyTaret
    {
        switch(type)
        {
            case LazyProxyFactoryType.Class:
            {
                const target = class
                {
                    public static lazy: Lazy<any> = lazy;
                };

                return target;
            }
            case LazyProxyFactoryType.Function:
            {
                const target = () => {};

                target.lazy = lazy;

                return target;
            }
            case LazyProxyFactoryType.Object:
            {
                const target = { lazy };

                return target;
            }
            default:
                throw new Error("Could not resolve lazy target type!");
        }
    }

    export function create<T_Value extends object>(factory: Factory<T_Value>): T_Value
    {
        if (isEmpty(factory))
            throw new LazyProxyInitError("Factory must not be empty!");

        const lazy = new Lazy<T_Value>(factory.value);

        const target = createTarget(factory.type, lazy);

        const proxy = new Proxy(target, handler);

        return proxy as T_Value;
    }

    export function isInstanceOf<T_Value extends object>(value: T_Value): boolean
    {
        const lazy = getLazy(value);

        return isNotEmpty(lazy);
    }

    export function isInitialized<T_Value extends object>(value: T_Value): boolean
    {
        const lazy = getLazy(value);

        if (isEmpty(lazy))
            throw new LazyProxyTypeError("Provided value is not lazy proxy!");
        else
        {
            return lazy.isInitialized;
        }
    }
}
