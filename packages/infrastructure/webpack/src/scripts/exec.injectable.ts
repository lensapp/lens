import { getInjectable } from "@ogre-tools/injectable";
import { exec } from "child_process";
import { promisify } from "util";

const promisifiedExec = promisify(exec);

export type Exec = typeof promisifiedExec;

export const execInjectable = getInjectable({
  id: "exec",
  instantiate: () => promisifiedExec,
});
