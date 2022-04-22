/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";
import getDetailsUrlInjectable from "./get-details-url.injectable";

/**
 * @param selfLink The Kube selflink to show details for
 * @param resetSelected If true then will reset the selected kube object (which object is highlighted generally)
 * @default resetSelected true
 */
export type ShowDetails = (selfLink: string, resetSelected?: boolean) => void;

const showDetailsInjectable = getInjectable({
  id: "show-details",
  instantiate: (di): ShowDetails => {
    const observableHistory = di.inject(observableHistoryInjectable);
    const getDetailsUrl = di.inject(getDetailsUrlInjectable);

    return (selfLink, resetSelected = true) => {
      observableHistory.merge({
        search: getDetailsUrl(selfLink, resetSelected),
      });
    };
  },
});

export default showDetailsInjectable;
