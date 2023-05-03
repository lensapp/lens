/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { LimitRanges } from "./limit-ranges";
import limitRangesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/limit-ranges/limit-ranges-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const limitRangesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "limit-ranges-route-component",
  Component: LimitRanges,
  routeInjectable: limitRangesRouteInjectable,
});

export default limitRangesRouteComponentInjectable;
