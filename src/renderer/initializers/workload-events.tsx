/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { IsAllowedResource } from "../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { Events } from "../components/+events/events";

export interface WorkloadEventsProps {}

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

const NonInjectedWorkloadEvents = observer(({ isAllowedResource }: Dependencies & WorkloadEventsProps) => {
  if (!isAllowedResource("events")) {
    return null;
  }

  return (
    <Events
      className="box grow"
      compact
      hideFilters
    />
  );
});

export const WorkloadEvents = withInjectables<Dependencies, WorkloadEventsProps>(NonInjectedWorkloadEvents, {
  getProps: (di, props) => ({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
    ...props,
  }),
});
