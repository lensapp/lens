/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../renderer/components/select";
import { withInjectables } from "@ogre-tools/injectable-react";
import { defaultExtensionRegistryUrl, defaultExtensionRegistryUrlLocation } from "../../../../../../common/user-store/preferences-helpers";
import { Input } from "../../../../../../renderer/components/input";
import { isUrl } from "../../../../../../renderer/components/input/input_validators";
import type { UserStore } from "../../../../../../common/user-store";
import { runInAction } from "mobx";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";

interface Dependencies {
  userStore: UserStore;
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

const NonInjectedExtensionInstallRegistry = observer(({ userStore }: Dependencies) => {
  const [customUrl, setCustomUrl] = React.useState(userStore.extensionRegistryUrl.customUrl || "");

  return (
    <section id="extensionRegistryUrl">
      <SubTitle title="Extension Install Registry" />
      <Select
        id="extension-install-registry-input"
        options={extensionInstallRegistryOptions}
        value={userStore.extensionRegistryUrl.location}
        onChange={(value) =>
          runInAction(() => {
            userStore.extensionRegistryUrl.location =
              value?.value ?? defaultExtensionRegistryUrlLocation;

            if (userStore.extensionRegistryUrl.location === "custom") {
              userStore.extensionRegistryUrl.customUrl = "";
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
        onBlur={() => (userStore.extensionRegistryUrl.customUrl = customUrl)}
        placeholder="Custom Extension Registry URL..."
        disabled={userStore.extensionRegistryUrl.location !== "custom"}
      />
    </section>
  );
});

export const ExtensionInstallRegistry = withInjectables<Dependencies>(
  NonInjectedExtensionInstallRegistry,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
