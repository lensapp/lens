import { UpdateInfo } from "electron-updater";
import { UpdateFileInfo, ReleaseNoteInfo } from "builder-util-runtime";
import { bindPredicate, bindPredicateOr, hasOptionalProperty, hasTypedProperty, isNull, isObject, isString, isTypedArray, isNumber, isBoolean } from "../utils/type-narrowing";
import { createTypedSender } from "./type-enforced-ipc";

export const AutoUpdateLogPrefix = "[UPDATE-CHECKER]";
export const updateAvailale = createTypedSender({
  channel: "update-available",
  verifier: isUpdateAvailableArgs,
});

export type UpdateAvailableArgs = [backChannel: string, updateInfo: UpdateInfo];

function isUpdateFileInfo(src: unknown): src is UpdateFileInfo {
  return isObject(src)
    && hasTypedProperty(src, "sha512", isString)
    && hasTypedProperty(src, "url", isString)
    && hasOptionalProperty(src, "size", isNumber)
    && hasOptionalProperty(src, "blockMapSize", isNumber)
    && hasOptionalProperty(src, "isAdminRightsRequired", isBoolean);
}

function isReleaseNoteInfo(src: unknown): src is ReleaseNoteInfo {
  return isObject(src)
    && hasTypedProperty(src, "version", isString)
    && hasTypedProperty(src, "note", bindPredicateOr(isString, isNull));
}

function isUpdateInfo(src: unknown): src is UpdateInfo {
  return isObject(src)
    && hasTypedProperty(src, "version", isString)
    && hasTypedProperty(src, "releaseDate", isString)
    && hasTypedProperty(src, "files", bindPredicate(isTypedArray, isUpdateFileInfo))
    && hasOptionalProperty(src, "releaseName", bindPredicateOr(isString, isNull))
    && hasOptionalProperty(src, "releaseNotes", bindPredicateOr(isString, isReleaseNoteInfo, isNull))
    && hasOptionalProperty(src, "stagingPercentage", isNumber);
}

export function isUpdateAvailableArgs(args: unknown[]): args is UpdateAvailableArgs {
  return hasTypedProperty(args, 0, isString)
    && hasTypedProperty(args, 1, isUpdateInfo)
    && args.length === 2;
}

export type BackchannelArg = {
  doUpdate: false;
} | {
  doUpdate: true;
  now: boolean;
};

export type UpdateAvailableToBackchannel = [updateDecision: BackchannelArg];

function isBackChannelArg(src: unknown): src is BackchannelArg {
  if (!(
    isObject(src)
      && hasTypedProperty(src, "doUpdate", isBoolean)
  )) {
    return false;
  }

  return !src.doUpdate
    || hasTypedProperty(src, "now", isBoolean);
}

export function areArgsUpdateAvailableToBackchannel(args: unknown[]): args is UpdateAvailableToBackchannel {
  return hasTypedProperty(args, 0, isBackChannelArg)
    && args.length === 1;
}
