/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { Events } from "../components/+events/events";

export interface WorkloadEventsProps {}

interface Dependencies {
  workloadEventsAreAllowed: IComputedValue<boolean>;
}

const NonInjectedWorkloadEvents = observer(({ workloadEventsAreAllowed }: Dependencies & WorkloadEventsProps) => {
  if (!workloadEventsAreAllowed.get()) {
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
    workloadEventsAreAllowed: di.inject(isAllowedResourceInjectable, "events"),
    ...props,
  }),
});
