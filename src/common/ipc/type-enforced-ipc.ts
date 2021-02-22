import { ipcMain, ipcRenderer } from "electron";
import { EventEmitter } from "events";
import logger from "../../main/logger";
import { broadcastMessage } from "./ipc";

export type HandlerEvent<EM extends EventEmitter> = Parameters<Parameters<EM["on"]>[1]>[0];
export type ListVerifier<T extends any[]> = (args: unknown[]) => args is T;
export type Rest<T> = T extends [any, ...infer R] ? R : [];
export type IpcListener<E extends Event, Args extends any[]> = (e: E, ...args: Args) => void;

export function isEmptyArgs(args: unknown[]): args is [] {
  return args.length === 0;
}

/**
 * Adds a listener to `source` that waits for the first IPC message with the correct
 * argument data is sent.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onceCorrect<
  EM extends EventEmitter,
  Listener extends IpcListener<Event, any[]>,
>({
  source,
  channel,
  listener,
  verifier,
}: {
  source: EM,
  channel: string | symbol,
  listener: Listener,
  verifier: ListVerifier<Rest<Parameters<Listener>>>,
}): void {
  function handler(event: HandlerEvent<EM>, ...args: unknown[]): void {
    if (verifier(args)) {
      source.removeListener(channel, handler); // remove immediately

      (async () => (listener(event, ...args)))() // might return a promise, or throw, or reject
        .catch((error: any) => logger.error("[IPC]: channel once handler threw error", { channel, error }));
    } else {
      logger.error("[IPC]: channel was emitted with invalid data", { channel, args });
    }
  }

  source.on(channel, handler);
}

/**
 * Adds a listener to `source` that checks to verify the arguments before calling the handler.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onCorrect<
  EM extends EventEmitter,
  Listener extends IpcListener<Event, any[]>,
>({
  source,
  channel,
  listener,
  verifier,
}: {
  source: EM,
  channel: string | symbol,
  listener: Listener,
  verifier: ListVerifier<Rest<Parameters<Listener>>>,
}): void {
  source.on(channel, (event, ...args: unknown[]) => {
    if (verifier(args)) {
      (async () => (listener(event, ...args)))() // might return a promise, or throw, or reject
        .catch(error => logger.error("[IPC]: channel on handler threw error", { channel, error }));
    } else {
      logger.error("[IPC]: channel was emitted with invalid data", { channel, args });
    }
  });
}

interface IPCEncodedError {
  name: string,
  message: string,
  extra: Record<string, any>,
}

function encodeError(e: Error): IPCEncodedError {
  delete e.stack;

  return {
    name: e.name,
    message: e.message,
    extra: { ...e },
  };
}

function decodeError({ extra, message, name }: IPCEncodedError): Error {
  const e = new Error(message);

  e.name = name;

  Object.assign(e, extra);

  return e;
}

export function handleCorrect<
  Handler extends (event: Event, ...args: any[]) => any
>({
  channel,
  handler,
  verifier,
}: {
  channel: string,
  handler: Handler,
  verifier: ListVerifier<Rest<Parameters<Handler>>>,
}): void {
  ipcMain.handle(channel, async (event, ...args: unknown[]) => {
    try {
      if (verifier(args)) {
        const result = await Promise.resolve(handler(event, ...args));

        return { result };
      } else {
        throw new TypeError("Arguments are wrong type");
      }
    } catch (error) {
      return { error: encodeError(error) };
    }
  });
}

export async function invokeWithDecode<
  L extends any[],
>({
  channel,
  args
}: {
  channel: string,
  args: L
}): Promise<any> {
  const { error, result } = await ipcRenderer.invoke(channel, ...args);

  if (error) {
    throw decodeError(error);
  }

  return result;
}

export interface TypedInvoker<
  Handler extends (event: Event, ...args: any[]) => any
> {
  invoke: (...args: Rest<Parameters<Handler>>) => Promise<ReturnType<Handler>>,
}

export function createTypedInvoker<
  Handler extends (event: Event, ...args: any[]) => any
>({
  channel,
  handler,
  verifier,
}: {
  channel: string,
  handler: Handler,
  verifier: ListVerifier<Rest<Parameters<Handler>>>,
}): TypedInvoker<Handler> {
  if (ipcMain) {
    handleCorrect({
      channel,
      handler,
      verifier,
    });
  } else if (ipcRenderer) {
    return {
      invoke(...args) {
        return invokeWithDecode({
          channel,
          args
        });
      }
    };
  }

  return {
    invoke() {
      throw new TypeError("invoke called in main");
    }
  };
}

export interface TypedSender<
  Args extends any[]
> {
  broadcast: (...args: Args) => void,
  on: (listener: IpcListener<Event, Args>) => void,
  once: (listener: IpcListener<Event, Args>) => void,
}

export function createTypedSender<
  Args extends any[]
>({
  channel,
  verifier,
}: {
  channel: string,
  verifier: ListVerifier<Args>,
}): TypedSender<Args> {
  return {
    broadcast(...args) {
      broadcastMessage(channel, ...args);
    },
    on(listener) {
      onCorrect({
        source: ipcMain ?? ipcRenderer,
        channel,
        listener,
        verifier: verifier as ListVerifier<Rest<[e: Event, ...args: Args]>>,
      });
    },
    once(listener) {
      onceCorrect({
        source: ipcMain ?? ipcRenderer,
        channel,
        listener,
        verifier: verifier as ListVerifier<Rest<[e: Event, ...args: Args]>>,
      });
    }
  };
}
