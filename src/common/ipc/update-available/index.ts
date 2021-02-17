import { UpdateInfo } from "electron-updater";

export const UpdateAvailableChannel = "update-available";
export const AutoUpdateLogPrefix = "[UPDATE-CHECKER]";

export type UpdateAvailableFromMain = [backChannel: string, updateInfo: UpdateInfo];

export function areArgsUpdateAvailableFromMain(args: unknown[]): args is UpdateAvailableFromMain {
  if (args.length !== 2) {
    return false;
  }

  if (typeof args[0] !== "string") {
    return false;
  }

  if (typeof args[1] !== "object" || args[1] === null) {
    // TODO: improve this checking
    return false;
  }

  return true;
}

export type BackchannelArg = {
  doUpdate: false;
} | {
  doUpdate: true;
  now: boolean;
};

export type UpdateAvailableToBackchannel = [updateDecision: BackchannelArg];

export function areArgsUpdateAvailableToBackchannel(args: unknown[]): args is UpdateAvailableToBackchannel {
  if (args.length !== 1) {
    return false;
  }

  if (typeof args[0] !== "object" || args[0] === null) {
    // TODO: improve this checking
    return false;
  }

  return true;
}
