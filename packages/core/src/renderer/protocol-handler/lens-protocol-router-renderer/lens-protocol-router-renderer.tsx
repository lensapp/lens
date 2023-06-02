/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ipcRenderer } from "electron";
import * as proto from "../../../common/protocol-handler";
import Url from "url-parse";
import type { LensProtocolRouterDependencies } from "../../../common/protocol-handler";
import { foldAttemptResults, ProtocolHandlerInvalid, RouteAttempt } from "../../../common/protocol-handler";
import type { ShowNotification } from "@k8slens/notifications";

interface Dependencies extends LensProtocolRouterDependencies {
  showShortInfoNotification: ShowNotification;
  showErrorNotification: ShowNotification;
}

export class LensProtocolRouterRenderer extends proto.LensProtocolRouter {
  constructor(protected readonly dependencies: Dependencies) {
    super(dependencies);
  }

  /**
   * This function is needed to be called early on in the renderers lifetime.
   */
  public init(): void {
    ipcRenderer.on(proto.ProtocolHandlerInternal, (event, rawUrl: string, mainAttemptResult: RouteAttempt) => {
      const rendererAttempt = this._routeToInternal(new Url(rawUrl, true));

      if (foldAttemptResults(mainAttemptResult, rendererAttempt) === RouteAttempt.MISSING) {
        this.dependencies.showShortInfoNotification((
          <p>
            {"Unknown action "}
            <code>{rawUrl}</code>
            {". Are you on the latest version?"}
          </p>
        ));
      }
    });
    ipcRenderer.on(proto.ProtocolHandlerExtension, async (event, rawUrl: string, mainAttemptResult: RouteAttempt) => {
      const rendererAttempt = await this._routeToExtension(new Url(rawUrl, true));

      switch (foldAttemptResults(mainAttemptResult, rendererAttempt)) {
        case RouteAttempt.MISSING:
          this.dependencies.showShortInfoNotification((
            <p>
              {"Unknown action "}
              <code>{rawUrl}</code>
              {". Are you on the latest version of the extension?"}
            </p>
          ));
          break;
        case RouteAttempt.MISSING_EXTENSION:
          this.dependencies.showShortInfoNotification((
            <p>
              {"Missing extension for action "}
              <code>{rawUrl}</code>
              {". Not able to find extension in our known list. Try installing it manually."}
            </p>
          ));
          break;
      }
    });
    ipcRenderer.on(ProtocolHandlerInvalid, (event, error: string, rawUrl: string) => {
      this.dependencies.showErrorNotification((
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
    });
  }
}
