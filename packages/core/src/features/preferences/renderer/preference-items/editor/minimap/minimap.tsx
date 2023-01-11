/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { Switch } from "../../../../../../renderer/components/switch";
import { SubHeader } from "../../../../../../renderer/components/layout/sub-header";
import { Select } from "../../../../../../renderer/components/select";
import { observer } from "mobx-react";

interface Dependencies {
  userStore: UserStore;
}

const minimapPositionOptions = (["left", "right"] as const)
  .map(side => ({
    value: side,
    label: side,
  }));


const NonInjectedMinimap = observer(({ userStore: { editorConfiguration }}: Dependencies) => (
  <section>
    <SubTitle title="Minimap"/>

    <div className="flex gaps justify-space-between">
      <div className="flex gaps align-center">
        <Switch
          checked={editorConfiguration.minimap.enabled}
          onChange={() => editorConfiguration.minimap.enabled = !editorConfiguration.minimap.enabled}
        >
          Show minimap
        </Switch>
      </div>
      <div className="flex gaps align-center">
        <SubHeader compact>Position</SubHeader>
        <Select
          id="minimap-input"
          themeName="lens"
          options={minimapPositionOptions}
          value={editorConfiguration.minimap.side}
          onChange={option => editorConfiguration.minimap.side = option?.value}
        />
      </div>
    </div>
  </section>
));

export const Minimap = withInjectables<Dependencies>(
  NonInjectedMinimap,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
