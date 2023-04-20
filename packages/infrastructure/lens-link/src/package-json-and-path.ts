export interface PackageJson {
  name: string;
  main: string;
  files: string[];
}

export interface PackageJsonAndPath {
  packageJsonPath: string;
  content: PackageJson;
}
