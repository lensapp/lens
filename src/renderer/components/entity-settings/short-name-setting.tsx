/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import type { EntityPreferencesStore } from "../../../common/entity-preferences/store";
import { computeDefaultShortName, limitGraphemeLengthOf } from "../../../common/catalog/helpers";
import { withInjectables } from "@ogre-tools/injectable-react";
import entityPreferencesStoreInjectable from "../../../common/entity-preferences/store.injectable";
import type { EntitySettingViewProps } from "../+entity-settings/extension-registrator.injectable";

interface Dependencies {
  entityPreferencesStore: EntityPreferencesStore;
}

const maxShortNameLength = 5;

const NonInjectedShortNameSetting = observer(({
  entity,
  entityPreferencesStore,
}: Dependencies & EntitySettingViewProps) => {
  const [shortName, setShortName] = useState(entity.metadata.shortName ?? "");

  return (
    <section data-testid="short-name-settings-section">
      <section>
        <SubTitle title="Entity Short Name" />
        <Input
          theme="round-black"
          value={shortName}
          placeholder={computeDefaultShortName(entity.getName())}
          onChange={value => setShortName(limitGraphemeLengthOf(value, maxShortNameLength))}
          data-testid="short-name-setting-input"
          onBlur={() => entityPreferencesStore.mergePreferences(entity.getId(), { shortName })}
        />
        <small className="hint">
          The text for entity icons. By default it is calculated from the entity name.
        </small>
      </section>
    </section>
  );
});

export const ShortNameSetting = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedShortNameSetting, {
  getProps: (di, props) => ({
    ...props,
    entityPreferencesStore: di.inject(entityPreferencesStoreInjectable),
  }),
});
