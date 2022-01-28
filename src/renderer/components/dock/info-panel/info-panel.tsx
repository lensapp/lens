/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./info-panel.scss";

import React, { ReactNode, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../../utils";
import { Button } from "../../button";
import { Icon } from "../../icon";
import { Spinner } from "../../spinner";
import type { DockStore, TabId } from "../dock/store";
import { Notifications } from "../../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";

export interface InfoPanelProps<ShowNotifications extends boolean = boolean> {
  tabId: TabId;
  className?: string;
  submit?: ShowNotifications extends false
  ? () => Promise<void>
  : () => Promise<ReactNode>;
  showNotifications?: ShowNotifications;
  error?: string;
  controls?: ReactNode;
  submitLabel?: ReactNode;
  submittingMessage?: ReactNode;
  disableSubmit?: boolean;
  showButtons?: boolean
  showSubmitClose?: boolean;
  showInlineInfo?: boolean;
  showStatusPanel?: boolean;
}

interface Dependencies {
  dockStore: DockStore;
}

const NonInjectedInfoPanel = observer(({
  dockStore,
  tabId,
  className,
  controls,
  submitLabel = "Submit",
  submittingMessage = "Submitting...",
  showButtons = true,
  showSubmitClose = true,
  showInlineInfo = true,
  showNotifications = true,
  showStatusPanel = true,
  disableSubmit = false,
  error,
  submit,
}: Dependencies & InfoPanelProps) => {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => setWaiting(false), [tabId]);

  const onSubmit = async () => {
    setWaiting(true);

    try {
      const result = await submit();

      if (showNotifications) {
        Notifications.ok(result as React.ReactNode);
      }
    } catch (error) {
      if (showNotifications) {
        Notifications.error(error.toString());
      }
    } finally {
      setWaiting(false);
    }
  };

  const submitAndClose = async () => {
    await onSubmit();
    close();
  };

  const close = () => {
    dockStore.closeTab(tabId);
  };

  const renderErrorIcon = () => {
    if (!showInlineInfo || !error) {
      return null;
    }

    return (
      <div className="error">
        <Icon material="error_outline" tooltip={error} />
      </div>
    );
  };

  const isDisabled = !!(disableSubmit || waiting || error);

  return (
    <div className={cssNames("InfoPanel flex gaps align-center", className)}>
      <div className="controls">
        {controls}
      </div>
      {showStatusPanel && (
        <div className="flex gaps align-center">
          {
            waiting
              ? <>
                <Spinner /> {submittingMessage}
              </>
              : renderErrorIcon()
          }
        </div>
      )}
      {showButtons && (
        <>
          <Button plain label="Cancel" onClick={close} />
          <Button
            active
            outlined={showSubmitClose}
            primary={!showSubmitClose}// one button always should be primary (blue)
            label={submitLabel}
            onClick={submit}
            disabled={isDisabled}
          />
          {showSubmitClose && (
            <Button
              primary active
              label={`${submitLabel} & Close`}
              onClick={submitAndClose}
              disabled={isDisabled}
            />
          )}
        </>
      )}
    </div>
  );
});

export const InfoPanel = withInjectables<Dependencies, InfoPanelProps>(NonInjectedInfoPanel, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    ...props,
  }),
});
