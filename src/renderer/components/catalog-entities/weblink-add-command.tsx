/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Input } from "../input";
import { isUrl } from "../input/input_validators";
import type { WeblinkCreateOptions, WeblinkData } from "../../../common/weblinks/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeCommandDialogInjectable from "../command-palette/close-command-dialog.injectable";
import addWeblinkInjectable from "../../../common/weblinks/add-weblink.injectable";

export interface WeblinkAddCommandProps {}

interface Dependencies {
  closeCommandOverlay: () => void;
  addWeblink: (data: WeblinkCreateOptions) => WeblinkData;
}

const NonInjectedWeblinkAddCommand = observer(({ closeCommandOverlay, addWeblink }: Dependencies & WeblinkAddCommandProps) => {
  const [url, setUrl] = useState("");
  const [nameHidden, setNameHidden] = useState(true);
  const [dirty, setDirty] = useState(false);

  const onChangeUrl = (url: string) => {
    setDirty(true);
    setUrl(url);
  };

  const onSubmitUrl = (url: string) => {
    setDirty(true);
    setUrl(url);
    setNameHidden(false);
  };

  const onSubmit = (name: string) => {
    addWeblink({
      name: name || url,
      url,
    });
    closeCommandOverlay();
  };

  return (
    <>
      <Input
        placeholder="Link URL"
        autoFocus={nameHidden}
        theme="round-black"
        data-test-id="command-palette-weblink-add-url"
        validators={[isUrl]}
        dirty={dirty}
        value={url}
        onChange={onChangeUrl}
        onSubmit={onSubmitUrl}
        showValidationLine={true}
      />
      {
        nameHidden
          ? (
            <small className="hint">
                Please provide a web link URL (Press &quot;Enter&quot; to continue or &quot;Escape&quot; to cancel)
            </small>
          )
          : (
            <>
              <Input
                placeholder="Name (optional)"
                autoFocus={true}
                theme="round-black"
                data-test-id="command-palette-weblink-add-name"
                onSubmit={onSubmit}
                dirty={true}
              />
              <small className="hint">
                  Please provide a name for the web link (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
              </small>
            </>
          )
      }
    </>
  );
});

export const WeblinkAddCommand = withInjectables<Dependencies, WeblinkAddCommandProps>(NonInjectedWeblinkAddCommand, {
  getProps: (di, props) => ({
    closeCommandOverlay: di.inject(closeCommandDialogInjectable),
    addWeblink: di.inject(addWeblinkInjectable),
    ...props,
  }),
});
