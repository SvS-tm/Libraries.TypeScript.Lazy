import { createSafeProxyHandler } from "@svs-tm/system/helpers/reflection/proxy";
import { Undefinable } from "@svs-tm/system/types";
import { Constructor, Delegate } from "@svs-tm/system/types/functions";
import { AsyncLazy } from "async-lazy";
import { Promisable } from "@svs-tm/system/types/promises";
import { isEmpty, isNotEmpty } from "@svs-tm/system/guards";
import { AsyncLazyProxyInitError } from "proxy/errors/async-lazy-proxy-init-error";
import { AsyncLazyProxyTypeError } from "proxy/errors/async-lazy-proxy-type-error";
import { AsyncProxied } from "proxy/types/async-proxied";
import { LazyProxyFactoryType } from "proxy/types/lazy-proxy-factory-type";
import { LazyProxyObjectFactoryResult } from "proxy/types/lazy-proxy-object-factory-result";

const asyncLazyProxyMarker: unique symbol = Symbol("asyncLazyProxyMarker");

type AsyncLazyProxyTaret =
{
    lazy: AsyncLazy<any>;
    cache: Record<string | number | symbol, Delegate<any[], any>>;
};

const handler = createSafeProxyHandler<AsyncLazyProxyTaret>
(
    {
        apply: async (target, ...parameters) =>
        {
            const value = await target.lazy.getValueAsync();
    
            return Reflect.apply(value, ...parameters);
        },
        construct: async (target, parameters, newTarget) =>
        {
            const value = await target.lazy.getValueAsync();
    
            return Reflect.construct(value, parameters, value);
        },
        get: (target, property, receiver) =>
        {
            if (property === asyncLazyProxyMarker)
                return target.lazy;
    
            return target.cache[property] ??= async (...args: any[]) =>
            {
                const value = await target.lazy.getValueAsync();
    
                const memberValue = Reflect.get(value, property, receiver);
    
                if (typeof memberValue === 'function')
                {
                    return memberValue(...args);
                }
                else
                    return memberValue;
            };
        }
    }
);

export namespace AsyncLazyProxy
{
    function getAsyncLazy<T_Value extends object>(value: T_Value): Undefinable<AsyncLazy<T_Value>>
    {
        return (value as any)?.[asyncLazyProxyMarker] as Undefinable<AsyncLazy<T_Value>>;
    }

    export class Factory<T_Type extends object>
    {
        private constructor
        (
            public readonly type: LazyProxyFactoryType,
            public readonly value: Delegate<[], Promisable<T_Type>>
        )
        {
        }

        public static forObject<T_Object extends object>(factory: Delegate<[], Promisable<LazyProxyObjectFactoryResult<T_Object>>>): Factory<LazyProxyObjectFactoryResult<T_Object>>
        {
            return new Factory(LazyProxyFactoryType.Object, factory);
        }

        public static forClass<T_Class extends Constructor<any[], any>>(factory: Delegate<[], Promisable<T_Class>>): Factory<T_Class>
        {
            return new Factory(LazyProxyFactoryType.Class, factory);
        }

        public static forFunction<T_Function extends Delegate<any[], any>>(factory: Delegate<[], Promisable<T_Function>>): Factory<T_Function>
        {
            return new Factory(LazyProxyFactoryType.Function, factory);
        }
    }

    function createTarget(type: LazyProxyFactoryType, lazy: AsyncLazy<any>): AsyncLazyProxyTaret
    {
        switch(type)
        {
            case LazyProxyFactoryType.Class:
            {
                const target = class
                {
                    public static lazy: AsyncLazy<any> = lazy;
                    public static cache: Record<string | number | symbol, (...args: any[]) => any> = {};
                };

                return target;
            }
            case LazyProxyFactoryType.Function:
            {
                const target = Object.assign(() => {}, { lazy, cache: {} });

                return target;
            }
            case LazyProxyFactoryType.Object:
            {
                const target = { lazy, cache: {} };

                return target;
            }
            default:
                throw new Error("Could not resolve lazy target type!");
        }
    }

    export function create<T_Value extends object>(factory: Factory<T_Value>): AsyncProxied<T_Value>
    {
        if (isEmpty(factory))
            throw new AsyncLazyProxyInitError("Factory must not be empty!");

        const lazy = new AsyncLazy<T_Value>(factory.value);

        const target = createTarget(factory.type, lazy);

        const proxy = new Proxy(target, handler);

        return proxy as unknown as AsyncProxied<T_Value>;
    }

    export function isInstanceOf<T_Value extends object>(value: T_Value): boolean
    {
        const lazy = getAsyncLazy(value);

        return isNotEmpty(lazy);
    }

    export function isInitialized<T_Value extends object>(value: T_Value): boolean
    {
        const lazy = getAsyncLazy(value);

        if (isEmpty(lazy))
            throw new AsyncLazyProxyTypeError("Provided value is not an async lazy proxy!");
        else
            return lazy.isInitialized;
    }
}
