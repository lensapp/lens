import { getInjectable } from "@ogre-tools/injectable";
import { exec } from "child_process";

export type Exec = typeof exec;

export const execInjectable = getInjectable({
  id: "exec",
  instantiate: () => exec,
});
