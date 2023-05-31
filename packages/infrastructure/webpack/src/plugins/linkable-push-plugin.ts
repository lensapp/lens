import { pushLink } from "@ogre-tools/linkable";
import type { Compiler } from "webpack";

export class LinkablePushPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.afterEmit.tap("LinkablePushPlugin", async () => {
      await pushLink();
    });
  }
}
