/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { DockTab } from "../dock/store";
import { Spinner } from "../../spinner";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { EditResourceModel } from "./edit-resource-model/edit-resource-model.injectable";
import editResourceModelInjectable from "./edit-resource-model/edit-resource-model.injectable";
import { EditorPanel } from "../editor-panel";
import { InfoPanel } from "../info-panel";
import { Badge } from "../../badge";
import { Notice } from "../../+extensions/notice";

export interface EditResourceProps {
  tab: DockTab;
}

interface Dependencies {
  model: EditResourceModel;
}

const NonInjectedEditResource = observer(
  ({ model, tab: { id: tabId }}: EditResourceProps & Dependencies) => {
    return (
      <div className="EditResource flex column">
        {model.shouldShowErrorAboutNoResource && (
          <Notice>
            Resource not found
          </Notice>
        )}

        {!model.shouldShowErrorAboutNoResource && (
          <>
            <InfoPanel
              tabId={tabId}
              error={model.configuration.error.value.get()}
              submit={model.save}
              showNotifications={false}
              submitLabel="Save"
              submittingMessage="Applying..."
              submitTestId={`save-edit-resource-from-tab-for-${tabId}`}
              submitAndCloseTestId={`save-and-close-edit-resource-from-tab-for-${tabId}`}
              cancelTestId={`cancel-edit-resource-from-tab-for-${tabId}`}
              submittingTestId={`saving-edit-resource-from-tab-for-${tabId}`}
              controls={(
                <div className="resource-info flex gaps align-center">
                  <span>Kind:</span>
                  <Badge label={model.kind} />
                  <span>Name:</span>
                  <Badge label={model.name} />
                  <span>Namespace:</span>
                  <Badge label={model.namespace} />
                </div>
              )}
            />
            <EditorPanel
              tabId={tabId}
              value={model.configuration.value.get()}
              onChange={model.configuration.onChange}
              onError={model.configuration.error.onChange}
            />
          </>
        )}
      </div>
    );
  },
);

export const EditResource = withInjectables<Dependencies, EditResourceProps>(
  NonInjectedEditResource,
  {
    getPlaceholder: () => (
      <Spinner center data-testid="edit-resource-tab-spinner" />
    ),

    getProps: async (di, props) => ({
      model: await di.inject(editResourceModelInjectable, props.tab.id),
      ...props,
    }),
  },
);
