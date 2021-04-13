import { EventEmitter } from "events";
import logger from "../../main/logger";

export type HandlerEvent<EM extends EventEmitter> = Parameters<Parameters<EM["on"]>[1]>[0];
export type ListVerifier<T extends any[]> = (args: unknown[]) => args is T;
export type Rest<T> = T extends [any, ...infer R] ? R : [];

/**
 * Adds a listener to `source` that waits for the first IPC message with the correct
 * argument data is sent.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onceCorrect<
  EM extends EventEmitter,
  L extends (event: HandlerEvent<EM>, ...args: any[]) => any
>({
  source,
  channel,
  listener,
  verifier,
}: {
  source: EM,
  channel: string | symbol,
  listener: L,
  verifier: ListVerifier<Rest<Parameters<L>>>,
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
  L extends (event: HandlerEvent<EM>, ...args: any[]) => any
>({
  source,
  channel,
  listener,
  verifier,
}: {
  source: EM,
  channel: string | symbol,
  listener: L,
  verifier: ListVerifier<Rest<Parameters<L>>>,
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
