/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { CustomResourceDefinition } from "@k8slens/kube-object";
import { Badge } from "../badge";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Input } from "../input";
import { MonacoEditor } from "../monaco-editor";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";

export interface CRDDetailsProps extends KubeObjectDetailsProps<CustomResourceDefinition> {
}

interface Dependencies {
  logger: Logger;
}

@observer
class NonInjectedCRDDetails extends React.Component<CRDDetailsProps & Dependencies> {
  render() {
    const { object: crd } = this.props;

    if (!crd) {
      return null;
    }

    if (!(crd instanceof CustomResourceDefinition)) {
      this.props.logger.error("[CRDDetails]: passed object that is not an instanceof CustomResourceDefinition", crd);

      return null;
    }

    const { plural, singular, kind, listKind } = crd.getNames();
    const printerColumns = crd.getPrinterColumns();
    const validation = crd.getValidation();

    return (
      <div className="CRDDetails">
        <DrawerItem name="Group">
          {crd.getGroup()}
        </DrawerItem>
        <DrawerItem name="Version">
          {crd.getVersion()}
        </DrawerItem>
        <DrawerItem name="Stored versions">
          {crd.getStoredVersions()}
        </DrawerItem>
        <DrawerItem name="Scope">
          {crd.getScope()}
        </DrawerItem>
        <DrawerItem name="Resource">
          <Link to={crd.getResourceUrl()}>
            {crd.getResourceTitle()}
          </Link>
        </DrawerItem>
        <DrawerItem name="Conversion" className="flex gaps align-flex-start">
          <Input
            multiLine
            theme="round-black"
            className="box grow"
            value={crd.getConversion()}
            readOnly
          />
        </DrawerItem>
        <DrawerItem
          name="Conditions"
          className="conditions"
          labelsOnly
        >
          {
            crd.getConditions().map(condition => {
              const { type, message, lastTransitionTime, status } = condition;

              return (
                <Badge
                  key={type}
                  label={type}
                  disabled={status === "False"}
                  className={type}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p>
                        Last transition time:
                        {lastTransitionTime}
                      </p>
                    </>
                  )}
                />
              );
            })
          }
        </DrawerItem>
        <DrawerTitle>Names</DrawerTitle>
        <Table selectable className="names box grow">
          <TableHead>
            <TableCell>plural</TableCell>
            <TableCell>singular</TableCell>
            <TableCell>kind</TableCell>
            <TableCell>listKind</TableCell>
          </TableHead>
          <TableRow>
            <TableCell>{plural}</TableCell>
            <TableCell>{singular}</TableCell>
            <TableCell>{kind}</TableCell>
            <TableCell>{listKind}</TableCell>
          </TableRow>
        </Table>
        {printerColumns.length > 0 && (
          <>
            <DrawerTitle>Additional Printer Columns</DrawerTitle>
            <Table selectable className="printer-columns box grow">
              <TableHead>
                <TableCell className="name">Name</TableCell>
                <TableCell className="type">Type</TableCell>
                <TableCell className="json-path">JSON Path</TableCell>
              </TableHead>
              {
                printerColumns.map((column, index) => {
                  const { name, type, jsonPath } = column;

                  return (
                    <TableRow key={index}>
                      <TableCell className="name">{name}</TableCell>
                      <TableCell className="type">{type}</TableCell>
                      <TableCell className="json-path">
                        <Badge label={jsonPath}/>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </Table>
          </>
        )}
        {validation && (
          <>
            <DrawerTitle>Validation</DrawerTitle>
            <MonacoEditor
              readOnly
              value={validation}
              style={{ height: 400 }}
            />
          </>
        )}
      </div>
    );
  }
}

export const CRDDetails = withInjectables<Dependencies, CRDDetailsProps>(NonInjectedCRDDetails, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
  }),
});
