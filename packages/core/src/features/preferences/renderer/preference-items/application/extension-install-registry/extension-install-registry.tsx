/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../renderer/components/select";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Input } from "../../../../../../renderer/components/input";
import { isUrl } from "../../../../../../renderer/components/input/input_validators";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { defaultExtensionRegistryUrlLocation, defaultExtensionRegistryUrl } from "../../../../../user-preferences/common/preferences-helpers";

interface Dependencies {
  state: UserPreferencesState;
}

const extensionInstallRegistryOptions = [
  {
    value: "default",
    label: "Default Url",
  },
  {
    value: "npmrc",
    label: "Global .npmrc file's Url",
  },
  {
    value: "custom",
    label: "Custom Url",
  },
] as const;

const NonInjectedExtensionInstallRegistry = observer(({ state }: Dependencies) => {
  const [customUrl, setCustomUrl] = React.useState(state.extensionRegistryUrl.customUrl || "");

  return (
    <section id="extensionRegistryUrl">
      <SubTitle title="Extension Install Registry" />
      <Select
        id="extension-install-registry-input"
        options={extensionInstallRegistryOptions}
        value={state.extensionRegistryUrl.location}
        onChange={(value) =>
          runInAction(() => {
            state.extensionRegistryUrl.location =
              value?.value ?? defaultExtensionRegistryUrlLocation;

            if (state.extensionRegistryUrl.location === "custom") {
              state.extensionRegistryUrl.customUrl = "";
            }
          })
        }
        themeName="lens"
      />
      <p className="mt-4 mb-5 leading-relaxed">
        {
          "This setting is to change the registry URL for installing extensions by name. "
        }
        {`If you are unable to access the default registry (${defaultExtensionRegistryUrl}) you can change it in your `}
        <b>.npmrc</b>
        {" file or in the input below."}
      </p>

      <Input
        theme="round-black"
        validators={isUrl}
        value={customUrl}
        onChange={setCustomUrl}
        onBlur={() => (state.extensionRegistryUrl.customUrl = customUrl)}
        placeholder="Custom Extension Registry URL..."
        disabled={state.extensionRegistryUrl.location !== "custom"}
      />
    </section>
  );
});

export const ExtensionInstallRegistry = withInjectables<Dependencies>(NonInjectedExtensionInstallRegistry, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
