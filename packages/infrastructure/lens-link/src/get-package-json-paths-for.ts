import type { ReadJsonFile, ResolvePath } from "./lens-link";

export const getPackageJsonPathsFor =
  ({
    resolvePath,
    readJsonFile,
    workingDirectory,
  }: {
    workingDirectory: string;
    resolvePath: ResolvePath;
    readJsonFile: ReadJsonFile;
  }) =>
  async (configFilePath: string) => {
    const configFile = (await readJsonFile(configFilePath)) as string[];

    return configFile.map((linkPath: string) => resolvePath(workingDirectory, linkPath, "package.json"));
  };
