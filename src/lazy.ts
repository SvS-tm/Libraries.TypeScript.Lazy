import { Delegate } from "@svs-tm/system/types/functions";

export class Lazy<T_Value>
{
    private valueCreated: boolean = false;
    private value?: T_Value;

    public constructor(private readonly factory: Delegate<[], T_Value>)
    {
    }

    public get isInitialized()
    {
        return this.valueCreated;
    }

    public getValue(): T_Value
    {
        if (!this.valueCreated)
        {
            this.value = this.factory();
            this.valueCreated = true;
        }
        
        return this.value as T_Value;
    }
}
