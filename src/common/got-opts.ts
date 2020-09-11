import { Options } from "got/dist/source";
import { HttpsProxyAgent } from "hpagent";
import { userStore } from "./user-store";

declare type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<ObjectType, Exclude<keyof ObjectType, KeysType>>;
declare type Merge<FirstType, SecondType> = Except<FirstType, Extract<keyof FirstType, keyof SecondType>> & SecondType;
export type GotStreamFunctionOptions = Merge<Options, {
  isStream?: true;
}>;

export function defaultGotOptions(): Options {
  const { httpsProxy, allowUntrustedCAs } = userStore.preferences;
  const rejectUnauthorized = !allowUntrustedCAs;

  if (!httpsProxy) {
    return { rejectUnauthorized };
  }

  const https = new HttpsProxyAgent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 256,
    maxFreeSockets: 256,
    proxy: httpsProxy,
  });

  return {
    agent: { https },
    rejectUnauthorized,
  };
}
