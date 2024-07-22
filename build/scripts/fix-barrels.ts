import commandLineArgs from "command-line-args";
import { readFile, writeFile, rm } from "fs/promises";
import { glob } from "glob";

enum BarrelProcessingOperation
{
    Delete,
    Clean
}

type BarrelProcessingInfo = 
(
    {
        path: string;
    }
        &
    (
        
        {
            operation: BarrelProcessingOperation.Clean;
            cleanedExports: number;
        }
            |
        {
            operation: BarrelProcessingOperation.Delete;
        }
    )
);

async function fixBarrelFile(path: string): Promise<BarrelProcessingInfo>
{
    const text = await readFile(path, { encoding: "utf-8" });

    const originalLines = text
        .split("\n")
        .filter(line => line.match(/export \* from ".*";/));

    const processedLines = originalLines
        .filter(line => !line.match(/export \* from "\..*\/index";/));

    if (processedLines.length <= 0)
    {
        await rm(path, { force: true, maxRetries: 5 });

        return {
            operation: BarrelProcessingOperation.Delete,
            path
        };
    }
    else
    {
        const result = processedLines.join("\n");
    
        await writeFile(path, result, { encoding: "utf-8" });

        return {
            operation: BarrelProcessingOperation.Clean,
            path,
            cleanedExports: originalLines.length - processedLines.length
        };
    }
}

async function fixBarrels(path: string)
{
    const paths = await glob("**/index.ts", { absolute: true, cwd: path, nodir: true });

    console.log("Detected barrels", paths.length);

    const results = await Promise.all(paths.map(path => fixBarrelFile(path)));

    const deleted = results.filter(info => info.operation === BarrelProcessingOperation.Delete);
    const cleaned = results.filter(info => info.operation === BarrelProcessingOperation.Clean);

    console.log
    (
        "Post barrel processing info", 
        {
            deleted: deleted.length,
            cleaned: cleaned.length,
            totalCleanedExports: cleaned.reduce
            (
                (previous, current) => current.operation === BarrelProcessingOperation.Clean 
                    ? current.cleanedExports + previous 
                    : previous, 
                0
            )
        }
    );
}

const args = commandLineArgs([
    {
        name: "source",
        alias: "s",
        type: String
    }
]);

fixBarrels(args.source);
