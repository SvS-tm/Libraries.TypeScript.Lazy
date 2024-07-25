import { Delegate } from "@svs-tm/system/types/functions";
import { Promisable } from "@svs-tm/system/types/promises";

export class AsyncLazy<T_Value>
{
    private valueCreated: boolean = false;
    private value?: T_Value;

    public constructor(private readonly factory: Delegate<[], Promisable<T_Value>>)
    {
    }

    public get isInitialized()
    {
        return this.valueCreated;
    }

    public async getValueAsync(): Promise<T_Value>
    {
        if (!this.valueCreated)
        {
            this.value = await this.factory();
            this.valueCreated = true;
        }

        return this.value as T_Value;
    }
}
