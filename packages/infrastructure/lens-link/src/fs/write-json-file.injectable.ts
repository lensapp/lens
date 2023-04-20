import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";
import type { JsonValue } from "type-fest";

export type WriteJsonFile = (path: string, value: JsonValue) => Promise<void>;

export const writeJsonFileInjectable = getInjectable({
  id: "write-json-file",
  instantiate: (): WriteJsonFile => fse.writeJson,
});
