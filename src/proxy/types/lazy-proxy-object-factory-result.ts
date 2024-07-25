import { Functional, Constructable } from "@svs-tm/system/types/functions";
import { IsNever } from "@svs-tm/system/types/reflection";

export type LazyProxyObjectFactoryResult<T_Object extends object> =
(
    IsNever<Functional<T_Object> | Constructable<T_Object>> extends true
        ? T_Object
        : never
);
