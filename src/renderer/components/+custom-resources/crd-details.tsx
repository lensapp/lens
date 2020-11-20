import "./crd-details.scss";

import React from "react";
import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { apiManager } from "../../api/api-manager";
import { crdApi, CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { cssNames } from "../../utils";
import { AceEditor } from "../ace-editor";
import { Badge } from "../badge";
import { DrawerItem, DrawerTitle } from "../drawer";
import { KubeObjectDetailsProps } from "../kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Input } from "../input";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

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

        <DrawerItem name={<Trans>Group</Trans>}>
          {crd.getGroup()}
        </DrawerItem>
        <DrawerItem name={<Trans>Version</Trans>}>
          {crd.getVersion()}
        </DrawerItem>
        <DrawerItem name={<Trans>Stored versions</Trans>}>
          {crd.getStoredVersions()}
        </DrawerItem>
        <DrawerItem name={<Trans>Scope</Trans>}>
          {crd.getScope()}
        </DrawerItem>
        <DrawerItem name={<Trans>Resource</Trans>}>
          <Link to={crd.getResourceUrl()}>
            {crd.getResourceTitle()}
          </Link>
        </DrawerItem>
        <DrawerItem name={<Trans>Conversion</Trans>} className="flex gaps align-flex-start">
          <Input
            multiLine
            theme="round-black"
            className="box grow"
            value={crd.getConversion()}
            readOnly
          />
        </DrawerItem>
        <DrawerItem name={<Trans>Conditions</Trans>} className="conditions" labelsOnly>
          {
            crd.getConditions().map(condition => {
              const { type, message, lastTransitionTime, status } = condition
              return (
                <Badge
                  key={type}
                  label={type}
                  className={cssNames({ disabled: status === "False" }, type)}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p><Trans>Last transition time: {lastTransitionTime}</Trans></p>
                    </>
                  )}
                />
              );
            })
          }
        </DrawerItem>
        <DrawerTitle title={<Trans>Names</Trans>}/>
        <Table selectable className="names box grow">
          <TableHead>
            <TableCell><Trans>plural</Trans></TableCell>
            <TableCell><Trans>singular</Trans></TableCell>
            <TableCell><Trans>kind</Trans></TableCell>
            <TableCell><Trans>listKind</Trans></TableCell>
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
          <DrawerTitle title={<Trans>Additional Printer Columns</Trans>}/>
          <Table selectable className="printer-columns box grow">
            <TableHead>
              <TableCell className="name"><Trans>Name</Trans></TableCell>
              <TableCell className="type"><Trans>Type</Trans></TableCell>
              <TableCell className="json-path"><Trans>JSON Path</Trans></TableCell>
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
                )
              })
            }
          </Table>
        </>
        }
        {validation &&
        <>
          <DrawerTitle title={<Trans>Validation</Trans>}/>
          <AceEditor
            mode="json"
            className="validation"
            value={validation}
            readOnly
          />
        </>
        }
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "CustomResourceDefinition",
  apiVersions: ["apiextensions.k8s.io/v1", "apiextensions.k8s.io/v1beta1"],
  components: {
    Details: (props) => <CRDDetails {...props} />
  }
})
