import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import commandLineArgs from "command-line-args";

async function generateLicenseFile(source: string, destination: string)
{
    const licenseTemplate = await readFile(source, { encoding: 'utf-8' });
    const packageConfig = JSON.parse(await readFile('package.json', { encoding: 'utf-8' }));

    const year = new Date().getUTCFullYear();
    const author = packageConfig.author;

    const result = licenseTemplate
        .replace('[year]', year.toString())
        .replace('[author]', author);

    const outputPath = destination;
    const outputPathDirectory = dirname(outputPath);

    if (!existsSync(outputPathDirectory))
        mkdirSync(outputPathDirectory, { recursive: true });

    await writeFile(outputPath, result, { encoding: 'utf-8' });
}

const args = commandLineArgs([
    {
        name: "source",
        alias: "s",
        type: String
    },
    {
        name: "destination",
        alias: "d",
        type: String
    }
]);

generateLicenseFile(args.source, args.destination);
