/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { Select } from "../../../../../../renderer/components/select";
import moment from "moment-timezone";
import { observer } from "mobx-react";
import currentTimezoneInjectable from "../../../../../../common/user-store/current-timezone.injectable";

interface Dependencies {
  userStore: UserStore;
  currentTimezone: string;
}

const timezoneOptions = moment.tz.names()
  .map(timezone => ({
    value: timezone,
    label: timezone.replace("_", " "),
  }));


const NonInjectedTimezone = observer(({
  userStore,
  currentTimezone,
}: Dependencies) => (
  <section id="locale">
    <SubTitle title="Locale Timezone" />
    <Select
      id="timezone-input"
      options={timezoneOptions}
      value={userStore.localeTimezone}
      onChange={value => userStore.localeTimezone = value?.value ?? currentTimezone}
      themeName="lens"
    />
  </section>

));

export const Timezone = withInjectables<Dependencies>(NonInjectedTimezone, {
  getProps: (di) => ({
    userStore: di.inject(userStoreInjectable),
    currentTimezone: di.inject(currentTimezoneInjectable),
  }),
});
