import { describe, expect, jest, test } from "@jest/globals";
import { Lazy } from "lazy";

describe
(
    "Lazy", 
    () =>
    {
        test
        (
            "Lazy must return original value from factory", 
            () =>
            {
                const originalValue = {};
                
                const lazy = new Lazy(() => originalValue);

                for(let index = 0; index < 10; ++index)
                {
                    const resultValue = lazy.getValue();

                    expect(originalValue).toBe(resultValue);
                }
            }
        );

        test
        (
            "Lazy must not be initialized before first access",
            () =>
            {
                const lazy = new Lazy(() => ({}));

                expect(lazy.isInitialized).toBe(false);
            }
        );

        test
        (
            "Lazy must be initialized only once",
            () =>
            {
                const factory = jest.fn(() => ({}));

                const lazy = new Lazy(factory);

                for(let index = 0; index < 10; ++index)
                {
                    lazy.getValue();
                }

                expect(lazy.isInitialized).toBe(true);
                expect(factory).toHaveBeenCalledTimes(1);
            }
        );
    }
);
