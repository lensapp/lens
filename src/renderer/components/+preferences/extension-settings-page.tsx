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

import React from "react";
import { matchPath, RouteComponentProps } from "react-router";
import { extensionSettingsRoute } from "../../../common/routes";
import { AppPreferenceRegistry } from "../../../extensions/registries";
import { ExtensionSettings } from "./extension-settings";

interface Props extends RouteComponentProps<{ extensionId?: string }> {
}

export const ExtensionSettingsPage = (props: Props) => {
  // https://github.com/remix-run/react-router/issues/5870#issuecomment-394194338
  const match = matchPath<{ extensionId: string }>(props.location.pathname, {
    path: extensionSettingsRoute.path,
    exact: true,
  });

  if (!match?.params.extensionId) {
    return (
      <div>No extension id provided in URL</div>
    );
  }

  const extensionId = decodeURIComponent(match?.params.extensionId);
  const settings = AppPreferenceRegistry.getInstance().getItems();
  const currentSettings = settings.filter(setting => setting.extensionId == extensionId);

  const renderContent = () => {
    if (!currentSettings.length) {
      return (
        <div>No settings found</div>
      );
    }

    return currentSettings.filter(e => !e.showInPreferencesTab).map((setting) =>
      <ExtensionSettings key={setting.id} setting={setting} size="small" />,
    );
  };

  return (
    <section id="extensions">
      <h2>{extensionId} settings</h2>
      {renderContent()}
    </section>
  );
};
