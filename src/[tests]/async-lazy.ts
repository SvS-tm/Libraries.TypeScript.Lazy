import { describe, expect, jest, test } from "@jest/globals";
import { AsyncLazy } from "async-lazy";

describe
(
    "AsyncLazy", 
    () =>
    {
        test
        (
            "AsyncLazy must return original value from factory", 
            async () =>
            {
                const originalValue = {};
                
                const lazy = new AsyncLazy(async () => originalValue);

                for(let index = 0; index < 10; ++index)
                {
                    const resultValue = await lazy.getValueAsync();

                    expect(originalValue).toBe(resultValue);
                }
            }
        );

        test
        (
            "AsyncLazy must not be initialized before first access",
            () =>
            {
                const lazy = new AsyncLazy(async () => ({}));

                expect(lazy.isInitialized).toBe(false);
            }
        );

        test
        (
            "AsyncLazy must be initialized only once",
            async () =>
            {
                const factory = jest.fn(async () => ({}));

                const lazy = new AsyncLazy(factory);

                for(let index = 0; index < 10; ++index)
                {
                    await lazy.getValueAsync();
                }

                expect(lazy.isInitialized).toBe(true);
                expect(factory).toHaveBeenCalledTimes(1);
            }
        );
    }
);
