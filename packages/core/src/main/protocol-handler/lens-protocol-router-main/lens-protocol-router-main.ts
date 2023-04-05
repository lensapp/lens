/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as proto from "../../../common/protocol-handler";
import URLParse from "url-parse";
import type { LensExtension } from "../../../extensions/lens-extension";
import { observable, when } from "mobx";
import type { LensProtocolRouterDependencies, RouteAttempt } from "../../../common/protocol-handler";
import { ProtocolHandlerInvalid } from "../../../common/protocol-handler";
import { disposer, noop } from "@k8slens/utilities";
import type { BroadcastMessage } from "../../../common/ipc/broadcast-message.injectable";

export interface FallbackHandler {
  (name: string): Promise<boolean>;
}

/**
 * This function checks if the host part is valid
 * @param host the URI host part
 * @returns `true` if it should be routed internally to Lens, `false` if to an extension
 * @throws if `host` is not valid
 */
function checkHost<Query>(url: URLParse<Query>): boolean {
  switch (url.host) {
    case "app":
      return true;
    case "extension":
      return false;
    default:
      throw new proto.RoutingError(proto.RoutingErrorType.INVALID_HOST, url);
  }
}

export interface LensProtocolRouterMainDependencies extends LensProtocolRouterDependencies {
  showApplicationWindow: () => Promise<void>;
  broadcastMessage: BroadcastMessage;
}

export class LensProtocolRouterMain extends proto.LensProtocolRouter {
  private readonly missingExtensionHandlers: FallbackHandler[] = [];

  // TODO: This is used to solve out-of-place temporal dependency. Remove, and solve otherwise.
  readonly rendererLoaded = observable.box(false);

  protected readonly disposers = disposer();

  constructor(protected readonly dependencies: LensProtocolRouterMainDependencies) {
    super(dependencies);
  }

  public cleanup() {
    this.disposers();
  }

  /**
   * Find the most specific registered handler, if it exists, and invoke it.
   *
   * This will send an IPC message to the renderer router to do the same
   * in the renderer.
   */
  public async route(rawUrl: string) {
    try {
      const url = new URLParse(rawUrl, true);

      if (url.protocol.toLowerCase() !== "lens:") {
        throw new proto.RoutingError(proto.RoutingErrorType.INVALID_PROTOCOL, url);
      }

      this.dependencies.showApplicationWindow().catch(noop);
      const routeInternally = checkHost(url);

      this.dependencies.logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: routing ${url.toString()}`);

      if (routeInternally) {
        this._routeToInternal(url);
      } else {
        await this._routeToExtension(url);
      }
    } catch (error) {
      this.dependencies.broadcastMessage(ProtocolHandlerInvalid, error ? String(error) : "unknown error", rawUrl);

      if (error instanceof proto.RoutingError) {
        this.dependencies.logger.error(`${proto.LensProtocolRouter.LoggingPrefix}: ${error}`, { url: error.url });
      } else {
        this.dependencies.logger.error(`${proto.LensProtocolRouter.LoggingPrefix}: ${error}`, { rawUrl });
      }
    }
  }

  protected async _executeMissingExtensionHandlers(extensionName: string): Promise<boolean> {
    for (const handler of this.missingExtensionHandlers) {
      if (await handler(extensionName)) {
        return true;
      }
    }

    return false;
  }

  protected async _findMatchingExtensionByName(url: URLParse<Record<string, string>>): Promise<LensExtension | string> {
    const firstAttempt = await super._findMatchingExtensionByName(url);

    if (typeof firstAttempt !== "string") {
      return firstAttempt;
    }

    if (await this._executeMissingExtensionHandlers(firstAttempt)) {
      return super._findMatchingExtensionByName(url);
    }

    return "";
  }

  protected _routeToInternal(url: URLParse<Record<string, string | undefined>>): RouteAttempt {
    const rawUrl = url.toString(); // for sending to renderer
    const attempt = super._routeToInternal(url);
    const broadcastToRenderer = () => this.dependencies.broadcastMessage(proto.ProtocolHandlerInternal, rawUrl, attempt);

    if (this.rendererLoaded.get()) {
      broadcastToRenderer();
    } else {
      this.disposers.push(when(() => this.rendererLoaded.get(), broadcastToRenderer));
    }

    return attempt;
  }

  protected async _routeToExtension(url: URLParse<Record<string, string | undefined>>): Promise<RouteAttempt> {
    const rawUrl = url.toString(); // for sending to renderer

    /**
     * This needs to be done first, so that the missing extension handlers can
     * be called before notifying the renderer.
     *
     * Note: this needs to clone the url because _routeToExtension modifies its
     * argument.
     */
    const attempt = await super._routeToExtension(new URLParse(url.toString(), true));
    const broadcastToRenderer = () => this.dependencies.broadcastMessage(proto.ProtocolHandlerExtension, rawUrl, attempt);

    if (this.rendererLoaded.get()) {
      broadcastToRenderer();
    } else {
      this.disposers.push(when(() => this.rendererLoaded.get(), broadcastToRenderer));
    }

    return attempt;
  }

  /**
   * Add a function to the list which will be sequentially called if an extension
   * is not found while routing to the extensions
   * @param handler A function that tries to find an extension
   */
  public addMissingExtensionHandler(handler: FallbackHandler): void {
    this.missingExtensionHandlers.push(handler);
  }
}
