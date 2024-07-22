import commandLineArgs from "command-line-args";
import { existsSync } from "fs";
import { copyFile, mkdir, writeFile } from "fs/promises";
import { glob } from "glob";
import { basename, dirname, join } from "path";

type Asset = 
{
    name: string;
    path: string;
    label?: string;
};

type ReleaseManifest =
{
    meta: string;
    assets: Asset[];
};

type AssetInput =
{
    glob: string;
    label?: string;
};

async function generateReleaseArtifact(binPath: string, files: AssetInput[])
{
    const groups = await Promise.all
    (
        files.map
        (
            async (input) => 
            (
                {
                    paths: await glob(input.glob, { cwd: binPath, absolute: false }),
                    label: input.label
                }
            )
        )
    );

    const assets = groups.flatMap((group) => group.paths.map(path => ({ path, label: group.label })));

    const manifest: ReleaseManifest = {
        meta: "package.json",
        assets: assets.map
        (
            (asset) => 
            (
                {
                    name: basename(asset.path),
                    path: asset.path,
                    label: asset.label
                }
            )
        )
    };

    const content = JSON.stringify(manifest);

    const artifactPath = join(binPath, ".release-artifact");

    if (!existsSync(artifactPath))
        await mkdir(artifactPath);

    await writeFile
    (
        join(artifactPath, "release-manifest.json"), 
        content, 
        { encoding: "utf-8" }
    );

    assets.push({ path: 'package.json', label: undefined });

    await Promise.all
    (
        assets.map
        (
            async (asset) =>
            {
                const path = join(binPath, asset.path);
                const directory = dirname(path);

                if (!existsSync(directory))
                    await mkdir(directory, { recursive: true });

                await copyFile
                (
                    path,
                    join(artifactPath, asset.path)
                );
            }
        )
    );
}

const args = commandLineArgs([
    {
        name: "files",
        alias: "f",
        type: (value) => value
            .split(';')
            .map
            (
                (input): AssetInput => 
                {
                    const [glob, label] = input.split('|');

                    return { glob, label };
                }
            )
    },
    {
        name: "binPath",
        alias: "b",
        type: String
    }
]);

generateReleaseArtifact(args.binPath, args.files);
