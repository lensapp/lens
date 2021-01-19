import { hasOwnProperties, hasOwnProperty, Singleton } from "../utils";

const ProtocolHandlerIpcPrefix = "protocol-handler";

export const ProtocolHandlerRegister = `${ProtocolHandlerIpcPrefix}:register`;
export const ProtocolHandlerDeregister = `${ProtocolHandlerIpcPrefix}:deregister`;
export const ProtocolHandlerBackChannel = `${ProtocolHandlerIpcPrefix}:back-channel`;

export interface RouteParams {
  search: Record<string, string>;
  pathname: Record<string, string>;
}

export type RouteHandler = (params: RouteParams) => void;
export type FallbackHandler = (name: string) => Promise<boolean>;

export enum HandlerType {
  INTERNAL = "internal",
  EXTENSION = "extension",
}

interface ExtensionParams {
  handlerType: HandlerType.EXTENSION,
  extensionName: string,
}

interface InternalParams {
  handlerType: HandlerType.INTERNAL,
}

type BaseParams = (ExtensionParams | InternalParams);

export type RegisterParams = BaseParams & {
  handlerId: string,
  pathSchema: string,
};

export interface DeregisterParams {
  extensionName: string,
}

export type BackChannelParams = BaseParams & {
  params: RouteParams;
  handlerId: string,
};

export abstract class LensProtocolRouter extends Singleton {
  public static readonly LoggingPrefix = "[PROTOCOL ROUTER]";

  public abstract on(urlSchema: string, handler: RouteHandler): void;
  public abstract extensionOn(extName: string, urlSchema: string, handler: RouteHandler): void;
  public abstract removeExtensionHandlers(extName: string): void;
}

/**
 * This function validates that `options` is at least `BaseParams`
 * @param args a deserialized value
 */
function validateBaseParams(args: unknown): args is BaseParams {
  if (!args || typeof args !== "object") {
    // it must be an object
    return false;
  }

  if (!hasOwnProperty(args, "handlerType")) {
    return false;
  }

  const { handlerType } = args;

  if (handlerType === HandlerType.INTERNAL) {
    // handlerType must either be HandlerType.INTERNAL
    return true;
  }

  if (handlerType === HandlerType.EXTENSION) {
    if (!hasOwnProperty(args, "extensionName")) {
      return false;
    }

    // or handlerType must be HandlerType.EXTENSION
    const { extensionName } = args;

    // but if for an extension then the extensionName is required, must be a stirng, and must be non-empty
    return Boolean(extensionName && typeof extensionName === "string");
  }

  // reject all other values of handlerType
  return false;
}

/**
 * This function validates that `options` is at least `RegisterParams`
 * @param args a deserialized value
 */
export function validateRegisterParams(args: unknown): args is RegisterParams {
  if (!validateBaseParams(args)) {
    return false;
  }

  if (!hasOwnProperties(args, "handlerId", "pathSchema")) {
    return false;
  }

  if (typeof args.handlerId !== "string" || args.handlerId.length === 0) {
    // handlerId is required, must be a string, must be non-empty
    return false;
  }

  if (typeof args.pathSchema !== "string" || args.pathSchema.length === 0) {
    // pathSchema is required, must be a string, must be non-empty
    return false;
  }

  return true;
}

/**
 * This function validates that `args` is at least `DeregisterParams`
 * @param args a deserialized value
 */
export function validateDeregisterParams(args: unknown): args is DeregisterParams {
  if (!args || typeof args !== "object") {
    // it must be an object
    return false;
  }

  if (!hasOwnProperties(args, "extensionName")) {
    return false;
  }

  if (typeof args.extensionName !== "string" || args.extensionName.length === 0) {
    // ipcChannel is required, must be a string, must be non-empty
    return false;
  }

  return true;
}

/**
 * This function validates that `args` is at least `RouteParams`
 * @param args a deserialized value
 */
export function validateRouteParams(args: unknown): args is RouteParams {
  if (!args || typeof args !== "object") {
    // it must be an object
    return false;
  }

  if (!hasOwnProperties(args, "search", "pathname")) {
    // must have `search` and `pathname` as keys
    return false;
  }

  if (args.search == null || typeof args.search !== "object") {
    // `search` must be a non-null object
    return false;
  }

  if (args.pathname == null || typeof args.pathname !== "object") {
    // `pathname` must be a non-null object
    return false;
  }

  for (const key in args.search) {
    if (!hasOwnProperty(args.search, key) || typeof args.search[key] !== "string") {
      // all keys in `search` must be owned and their corresponding values must be strings
      return false;
    }
  }

  for (const key in args.pathname) {
    if (!hasOwnProperty(args.pathname, key) || typeof args.pathname[key] !== "string") {
      // all keys in `pathname` must be owned and their corresponding values must be strings
      return false;
    }
  }

  return true;
}

/**
 * This function validates that `args` is at least `BackChannelParams`
 * @param args a deserialized value
 */
export function validateBackChannelParams(args: unknown): args is BackChannelParams {
  if (!validateBaseParams(args)) {
    return false;
  }

  if (!hasOwnProperties(args, "handlerId", "params")) {
    return false;
  }

  if (!validateRouteParams(args.params)) {
    return false;
  }

  if (typeof args.handlerId !== "string" || args.handlerId.length === 0) {
    return false;
  }

  return true;
}
