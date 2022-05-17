/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { match, RouteProps } from "react-router";
import { matchPath } from "react-router";
import observableHistoryInjectable from "./observable-history.injectable";

export type MatchRoute = <Params>(route: string | string[] | RouteProps) => match<Params> | null;

const matchRouteInjectable = getInjectable({
  id: "match-route",
  instantiate: (di): MatchRoute => {
    const observableHistory = di.inject(observableHistoryInjectable);

    return (route) => matchPath(observableHistory.location.pathname, route);
  },
});

export default matchRouteInjectable;
