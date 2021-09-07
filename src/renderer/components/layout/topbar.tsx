/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import styles from "./topbar.module.css";
import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { TopBarRegistry } from "../../../extensions/registries";
import { Icon } from "../icon";
import { webContents } from "@electron/remote";
import { observable } from "mobx";
import { ipcRendererOn } from "../../../common/ipc";
import { watchHistoryState } from "../../remote-helpers/history-updater";
import { isActiveRoute, navigate } from "../../navigation";
import { catalogRoute, catalogURL } from "../../../common/routes";
import { previousActiveTab } from "../+catalog";

interface Props extends React.HTMLAttributes<any> {
}

const prevEnabled = observable.box(false);
const nextEnabled = observable.box(false);

ipcRendererOn("history:can-go-back", (event, state: boolean) => {
  prevEnabled.set(state);
});

ipcRendererOn("history:can-go-forward", (event, state: boolean) => {
  nextEnabled.set(state);
});

export const TopBar = observer(({ children, ...rest }: Props) => {
  const renderRegisteredItems = () => {
    const items = TopBarRegistry.getInstance().getItems();

    if (!Array.isArray(items)) {
      return null;
    }

    return (
      <div>
        {items.map((registration, index) => {
          if (!registration?.components?.Item) {
            return null;
          }

          return (
            <div key={index}>
              <registration.components.Item />
            </div>
          );
        })}
      </div>
    );
  };

  const goHome = () => {
    navigate(`${catalogURL()}/${previousActiveTab.get()}`);
  };

  const goBack = () => {
    webContents.getAllWebContents().find((webContent) => webContent.getType() === "window")?.goBack();
  };

  const goForward = () => {
    webContents.getAllWebContents().find((webContent) => webContent.getType() === "window")?.goForward();
  };

  useEffect(() => {
    const disposer = watchHistoryState();

    return () => disposer();
  }, []);

  return (
    <div className={styles.topBar} {...rest}>
      <div className={styles.history}>
        <Icon
          data-testid="home-button"
          material="home"
          className="ml-5"
          onClick={goHome}
          disabled={isActiveRoute(catalogRoute)}
        />
        <Icon
          data-testid="history-back"
          material="arrow_back"
          className="ml-5"
          onClick={goBack}
          disabled={!prevEnabled.get()}
        />
        <Icon
          data-testid="history-forward"
          material="arrow_forward"
          className="ml-5"
          onClick={goForward}
          disabled={!nextEnabled.get()}
        />
      </div>
      <div className={styles.controls}>
        {renderRegisteredItems()}
        {children}
      </div>
    </div>
  );
});
