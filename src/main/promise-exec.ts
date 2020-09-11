import * as util from "util";
import { exec } from "child_process";

export const promiseExec = util.promisify(exec);

export async function stdOptimizedPromiseExec(url: string): Promise<string> {
  try {
    const { stdout } = await promiseExec(url);

    return stdout;
  } catch ({ stderr }) {
    throw stderr;
  }
}
