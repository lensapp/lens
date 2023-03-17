/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Select } from "../../../../../../renderer/components/select";
import moment from "moment-timezone";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import currentTimezoneInjectable from "../../../../../../common/vars/current-timezone.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
  currentTimezone: string;
}

const timezoneOptions = moment.tz.names()
  .map(timezone => ({
    value: timezone,
    label: timezone.replace("_", " "),
  }));

const NonInjectedTimezone = observer(({
  state,
  currentTimezone,
}: Dependencies) => (
  <section id="locale">
    <SubTitle title="Locale Timezone" />
    <Select
      id="timezone-input"
      options={timezoneOptions}
      value={state.localeTimezone}
      onChange={value => state.localeTimezone = value?.value ?? currentTimezone}
      themeName="lens"
    />
  </section>
));

export const Timezone = withInjectables<Dependencies>(NonInjectedTimezone, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    currentTimezone: di.inject(currentTimezoneInjectable),
  }),
});
