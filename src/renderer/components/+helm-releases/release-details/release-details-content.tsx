/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React from "react";

import { Link } from "react-router-dom";
import { Drawer, DrawerItem, DrawerTitle } from "../../drawer";
import { cssNames, stopPropagation } from "../../../utils";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ConfigurationInput, MinimalResourceGroup, OnlyUserSuppliedValuesAreShownToggle, ReleaseDetailsModel } from "./release-details-model/release-details-model.injectable";
import releaseDetailsModelInjectable from "./release-details-model/release-details-model.injectable";
import { Button } from "../../button";
import { kebabCase } from "lodash/fp";
import { Badge } from "../../badge";
import { SubTitle } from "../../layout/sub-title";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { ReactiveDuration } from "../../duration/reactive-duration";
import { HelmReleaseMenu } from "../release-menu";
import { Checkbox } from "../../checkbox";
import { MonacoEditor } from "../../monaco-editor";
import { Spinner } from "../../spinner";
import type { TargetHelmRelease } from "./target-helm-release.injectable";

interface ReleaseDetailsContentProps {
  targetRelease: TargetHelmRelease;
}

interface Dependencies {
  model: ReleaseDetailsModel;
}

const NonInjectedReleaseDetailsContent = observer(({ model }: Dependencies & ReleaseDetailsContentProps) => {
  const isLoading = model.isLoading.get();

  return (
    <Drawer
      className={cssNames("ReleaseDetails", model.activeTheme)}
      usePortal={true}
      open={true}
      title={isLoading ? "" : model.release.getName()}
      onClose={model.close}
      testIdForClose="close-helm-release-detail"
      toolbar={
        !isLoading && (
          <HelmReleaseMenu
            release={model.release}
            toolbar
            hideDetails={model.close}
          />
        )
      }
      data-testid={`helm-release-details-for-${model.id}`}
    >
      {isLoading ? (
        <Spinner center data-testid="helm-release-detail-content-spinner" />
      ) : (
        <div>
          <DrawerItem name="Chart" className="chart">
            <div className="flex gaps align-center">
              <span>{model.release.chart}</span>

              <Button
                primary
                label="Upgrade"
                className="box right upgrade"
                onClick={model.startUpgradeProcess}
                data-testid="helm-release-upgrade-button"
              />
            </div>
          </DrawerItem>

          <DrawerItem name="Updated">
            {model.release.getUpdated()}
            {` ago (${model.release.updated})`}
          </DrawerItem>

          <DrawerItem name="Namespace">{model.release.getNs()}</DrawerItem>

          <DrawerItem name="Version" onClick={stopPropagation}>
            <div className="version flex gaps align-center">
              <span>{model.release.getVersion()}</span>
            </div>
          </DrawerItem>

          <DrawerItem
            name="Status"
            className="status"
            labelsOnly>
            <Badge
              label={model.release.getStatus()}
              className={kebabCase(model.release.getStatus())}
            />
          </DrawerItem>

          <ReleaseValues
            configuration={model.configuration}
            onlyUserSuppliedValuesAreShown={
              model.onlyUserSuppliedValuesAreShown
            }
          />

          <DrawerTitle>Notes</DrawerTitle>

          {model.notes && <div className="notes">{model.notes}</div>}

          <DrawerTitle>Resources</DrawerTitle>

          {model.groupedResources.length > 0 && (
            <div className="resources">
              {model.groupedResources.map((group) => (
                <ResourceGroup key={group.kind} group={group} />
              ))}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
});

export const ReleaseDetailsContent = withInjectables<Dependencies, ReleaseDetailsContentProps>(NonInjectedReleaseDetailsContent, {
  getProps: (di, props) => ({
    model: di.inject(releaseDetailsModelInjectable, props.targetRelease),
    ...props,
  }),
});

const ResourceGroup = ({
  group: { kind, isNamespaced, resources },
}: {
  group: MinimalResourceGroup;
}) => (
  <>
    <SubTitle title={kind} />

    <Table scrollable={false}>
      <TableHead sticky={false}>
        <TableCell className="name">Name</TableCell>

        {isNamespaced && <TableCell className="namespace">Namespace</TableCell>}

        <TableCell className="age">Age</TableCell>
      </TableHead>

      {resources.map(
        ({ creationTimestamp, detailsUrl, name, namespace, uid }) => (
          <TableRow key={uid}>
            <TableCell className="name">
              {detailsUrl ? <Link to={detailsUrl}>{name}</Link> : name}
            </TableCell>

            {isNamespaced && (
              <TableCell className="namespace">{namespace}</TableCell>
            )}

            <TableCell className="age">
              <ReactiveDuration timestamp={creationTimestamp} />
            </TableCell>
          </TableRow>
        ),
      )}
    </Table>
  </>
);

interface ReleaseValuesProps {
  configuration: ConfigurationInput;
  onlyUserSuppliedValuesAreShown: OnlyUserSuppliedValuesAreShownToggle;
}

const ReleaseValues = observer(({ configuration, onlyUserSuppliedValuesAreShown }: ReleaseValuesProps) => {
  const configurationIsLoading = configuration.isLoading.get();

  return (
    <div className="values">
      <DrawerTitle>Values</DrawerTitle>

      <div className="flex column gaps">
        <Checkbox
          label="User-supplied values only"
          value={onlyUserSuppliedValuesAreShown.value.get()}
          onChange={onlyUserSuppliedValuesAreShown.toggle}
          disabled={configurationIsLoading}
          data-testid="user-supplied-values-only-checkbox"
        />

        <MonacoEditor
          id="helm-release-configuration"
          style={{ minHeight: 300 }}
          value={configuration.nonSavedValue.get()}
          onChange={configuration.onChange}
        />

        <Button
          primary
          label="Save"
          waiting={configuration.isSaving.get()}
          disabled={configurationIsLoading}
          onClick={configuration.save}
          data-testid="helm-release-configuration-save-button"
        />
      </div>
    </div>
  );
});
