import fetch from "node-fetch";
import { TypedRegEx } from "typed-regex";
import { XMLParser } from "fast-xml-parser";
import semver from "semver";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const { SemVer } = semver;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expectedResponseForm = TypedRegEx("v(?<version>\\d+\\.\\d+\\.\\d+)");

async function requestGreatestKubectlPatchVersion(majorMinor: string): Promise<string | undefined> {
  const response = await fetch(`https://dl.k8s.io/release/stable-${majorMinor}.txt`);

  if (response.status !== 200) {
    try {
      const parser = new XMLParser();
      const errorBody = parser.parse(await response.text());

      throw new Error(`failed to get stable version for ${majorMinor}: ${errorBody?.Error?.Message ?? response.statusText}`);
    } catch {
      throw new Error(`failed to get stable version for ${majorMinor}: ${response.statusText}`);
    }
  }

  const body = await response.text();
  const match = expectedResponseForm.captures(body);

  if (!match) {
    throw new Error(`failed to get stable version for ${majorMinor}: unexpected response shape. body="${body}"`);
  }

  return match.version;
}

async function requestAllVersions(): Promise<[string, string][]> {
  const greatestVersion = await requestGreatestKubectlPatchVersion("1");

  if (!greatestVersion) {
    return [];
  }

  const greatestSemVer = new SemVer(greatestVersion);
  const majorMinorRequests = new Array<string>(greatestSemVer.minor + 1)
    .fill("")
    .map((value, index) => `1.${index}`)
    .map(async (majorMinor) => [majorMinor, await requestGreatestKubectlPatchVersion(majorMinor)] as const);

  return (await Promise.all(majorMinorRequests))
    .filter((entry): entry is [string, string] => !!entry[1]);
}

async function main() {
  const versions = await requestAllVersions();

  await writeFile(path.join(__dirname, "versions.json"), JSON.stringify(versions, null, 4));
}

await main();
