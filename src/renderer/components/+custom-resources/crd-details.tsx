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

import "./crd-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { AceEditor } from "../ace-editor";
import { Badge } from "../badge";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Input } from "../input";
import { KubeObjectMeta } from "../kube-object-meta";

interface Props extends KubeObjectDetailsProps<CustomResourceDefinition> {
}

@observer
export class CRDDetails extends React.Component<Props> {
  render() {
    const { object: crd } = this.props;

    if (!crd) return null;
    const { plural, singular, kind, listKind } = crd.getNames();
    const printerColumns = crd.getPrinterColumns();
    const validation = crd.getValidation();

    return (
      <div className="CRDDetails">
        <KubeObjectMeta object={crd}/>

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
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
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
                      <p>Last transition time: {lastTransitionTime}</p>
                    </>
                  )}
                />
              );
            })
          }
        </DrawerItem>
        <DrawerTitle title="Names"/>
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
        {printerColumns.length > 0 &&
        <>
          <DrawerTitle title="Additional Printer Columns"/>
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
        }
        {validation &&
        <>
          <DrawerTitle title="Validation"/>
          <AceEditor
            mode="yaml"
            className="validation"
            value={validation}
            readOnly
          />
        </>
        }
      </div>
    );
  }
}
