/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ipcRenderer } from "electron";
import * as proto from "../../../common/protocol-handler";
import Url from "url-parse";
import { onCorrect } from "../../../common/ipc";
import { foldAttemptResults, ProtocolHandlerInvalid, RouteAttempt } from "../../../common/protocol-handler";
import { Notifications } from "../../components/notifications";
import type { ExtensionLoader } from "../../../extensions/extension-loader";
import type { ExtensionsStore } from "../../../extensions/extensions-store/extensions-store";

function verifyIpcArgs(args: unknown[]): args is [string, RouteAttempt] {
  if (args.length !== 2) {
    return false;
  }

  if (typeof args[0] !== "string") {
    return false;
  }

  switch (args[1]) {
    case RouteAttempt.MATCHED:
    case RouteAttempt.MISSING:
    case RouteAttempt.MISSING_EXTENSION:
      return true;
    default:
      return false;
  }
}

interface Dependencies {
  extensionLoader: ExtensionLoader;
  extensionsStore: ExtensionsStore;
}


export class LensProtocolRouterRenderer extends proto.LensProtocolRouter {
  constructor(protected dependencies: Dependencies) {
    super(dependencies);
  }

  /**
   * This function is needed to be called early on in the renderers lifetime.
   */
  public init(): void {
    onCorrect({
      channel: proto.ProtocolHandlerInternal,
      source: ipcRenderer,
      verifier: verifyIpcArgs,
      listener: (event, rawUrl, mainAttemptResult) => {
        const rendererAttempt = this._routeToInternal(new Url(rawUrl, true));

        if (foldAttemptResults(mainAttemptResult, rendererAttempt) === RouteAttempt.MISSING) {
          Notifications.shortInfo((
            <p>
              {"Unknown action "}
              <code>{rawUrl}</code>
              {". Are you on the latest version?"}
            </p>
          ));
        }
      },
    });
    onCorrect({
      channel: proto.ProtocolHandlerExtension,
      source: ipcRenderer,
      verifier: verifyIpcArgs,
      listener: async (event, rawUrl, mainAttemptResult) => {
        const rendererAttempt = await this._routeToExtension(new Url(rawUrl, true));

        switch (foldAttemptResults(mainAttemptResult, rendererAttempt)) {
          case RouteAttempt.MISSING:
            Notifications.shortInfo((
              <p>
                {"Unknown action "}
                <code>{rawUrl}</code>
                {". Are you on the latest version of the extension?"}
              </p>
            ));
            break;
          case RouteAttempt.MISSING_EXTENSION:
            Notifications.shortInfo((
              <p>
                {"Missing extension for action "}
                <code>{rawUrl}</code>
                {". Not able to find extension in our known list. Try installing it manually."}
              </p>
            ));
            break;
        }
      },
    });
    onCorrect({
      channel: ProtocolHandlerInvalid,
      source: ipcRenderer,
      listener: (event, error, rawUrl) => {
        Notifications.error((
          <>
            <p>
              {"Failed to route "}
              <code>{rawUrl}</code>
              .
            </p>
            <p>
              <b>Error:</b>
              {" "}
              {error}
            </p>
          </>
        ));
      },
      verifier: (args): args is [string, string] => {
        return args.length === 2 && typeof args[0] === "string";
      },
    });
  }
}
