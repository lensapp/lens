/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import { withInjectables } from "@ogre-tools/injectable-react";
import localeTimezoneInjectable from "./locale-timezone.injectable";
import type { IComputedValue } from "mobx";

export interface LocaleDateProps {
  date: string
}

interface Dependencies {
  localeTimezone: IComputedValue<string>;
}

const NonInjectedLocaleDate = observer(({ localeTimezone, date }: Dependencies & LocaleDateProps) => (
  <>{moment.tz(date, localeTimezone.get()).format()}</>
));

export const LocaleDate = withInjectables<Dependencies, LocaleDateProps>(NonInjectedLocaleDate, {
  getProps: (di, props) => ({
    localeTimezone: di.inject(localeTimezoneInjectable),
    ...props,
  }),
});
