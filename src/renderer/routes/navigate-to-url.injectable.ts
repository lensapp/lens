/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "../navigation/observable-history.injectable";
import { runInAction } from "mobx";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";
import { IpcRendererNavigationEvents } from "../navigation/events";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";

const navigateToUrlInjectable = getInjectable({
  id: "navigate-to-url",

  instantiate: (di) => {
    const observableHistory = di.inject(observableHistoryInjectable);
    const broadcastMessage = di.inject(broadcastMessageInjectable);

    return (url, options = {}) => {
      if (options.forceRootFrame) {
        broadcastMessage(IpcRendererNavigationEvents.NAVIGATE_IN_APP, url);

        return;
      }

      runInAction(() => {
        if (options.withoutAffectingBackButton) {
          observableHistory.replace(url);

          return;
        }

        observableHistory.push(url);
      });
    };
  },

  injectionToken: navigateToUrlInjectionToken,
});

export default navigateToUrlInjectable;
