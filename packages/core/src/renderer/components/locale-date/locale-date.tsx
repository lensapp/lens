/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import type { UserStore } from "../../../common/user-store";
import { withInjectables } from "@ogre-tools/injectable-react";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";

export interface LocaleDateProps {
  date: string;
}

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedLocaleDate = observer(({ date, userStore }: LocaleDateProps & Dependencies) => (
  <>
    {`${moment.tz(date, userStore.localeTimezone).format()}`}
  </>
));

export const LocaleDate = withInjectables<Dependencies, LocaleDateProps>(NonInjectedLocaleDate, {
  getProps: (di, props) => ({
    ...props,
    userStore: di.inject(userStoreInjectable),
  }),
});
