import { CallSignatures, Constructor, ConstructSignatures, Delegate } from "@svs-tm/system/types/functions";
import { Promised } from "@svs-tm/system/types/promises";
import { UnionToIntersection } from "@svs-tm/system/types/reflection";

type AsyncedDelegate<T_CallSignature> = T_CallSignature extends (...args: infer T_Args) => infer T_Result
    ? Delegate<T_Args, Promised<T_Result>>
    : never;

type AsyncedConstructor<T_Constructor> = T_Constructor extends new (...args: infer T_Args) => infer T_Result
    ? Constructor<T_Args, Promised<T_Result>>
    : never;

export type AsyncProxied<T_Entity> = 
(
    {
        readonly [T_Key in keyof T_Entity]: Delegate<[], Promised<T_Entity[T_Key]>>
    }
        &
    UnionToIntersection<AsyncedDelegate<CallSignatures<T_Entity>>>
        &
    UnionToIntersection<AsyncedConstructor<ConstructSignatures<T_Entity>>>
);
