import { describe, expect, jest, test } from "@jest/globals";

describe
(
    "Test suite", 
    () =>
    {
        test
        (
            "Test case", 
            () =>
            {
                const mockObject = jest.mocked<{ [key: string]: any }>({});
                const propName = "name";
                const propValue = "value";
                const mockedFunction = jest.fn
                (
                    () => 
                    {
                        mockObject[propName] = propValue;
                    }
                );

                mockedFunction();

                expect(mockedFunction).toBeCalledTimes(1);
                expect(mockObject).toHaveProperty(propName, propValue);
            }
        );
    }
);
