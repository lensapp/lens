import * as util from "util"
import { exec } from "child_process";

export const promiseExec = util.promisify(exec)
