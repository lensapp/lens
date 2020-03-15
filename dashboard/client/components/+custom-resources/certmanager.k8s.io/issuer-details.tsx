import "./issuer-details.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { KubeEventDetails } from "../../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../../kube-object";
import { clusterIssuersApi, Issuer, issuersApi } from "../../../api/endpoints/cert-manager.api";
import { autobind, cssNames } from "../../../utils";
import { getDetailsUrl } from "../../../navigation";
import { secretsApi } from "../../../api/endpoints";
import { apiManager } from "../../../api/api-manager";
import { KubeObjectMeta } from "../../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Issuer> {
}

@observer
export class IssuerDetails extends React.Component<Props> {
  @autobind()
  renderSecretLink(secretName: string) {
    const namespace = this.props.object.getNs();
    if (!namespace) {
      return secretName;
    }
    const secretDetailsUrl = getDetailsUrl(secretsApi.getUrl({
      namespace: namespace,
      name: secretName,
    }));
    return (
      <Link to={secretDetailsUrl}>
        {secretName}
      </Link>
    )
  }

  render() {
    const { object: issuer, className } = this.props;
    if (!issuer) return;
    const { renderSecretLink } = this;
    const { spec: { acme, ca, vault, venafi }, status } = issuer;
    return (
      <div className={cssNames("IssuerDetails", className)}>
        <KubeObjectMeta object={issuer}/>

        <DrawerItem name={<Trans>Type</Trans>}>
          {issuer.getType()}
        </DrawerItem>

        <DrawerItem name={<Trans>Status</Trans>} labelsOnly>
          {issuer.getConditions().map(({ type, tooltip, isReady }) => {
            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            )
          })}
        </DrawerItem>

        {acme && (() => {
          const { email, server, skipTLSVerify, privateKeySecretRef, solvers } = acme;
          return (
            <>
              <DrawerTitle title="ACME"/>
              <DrawerItem name={<Trans>E-mail</Trans>}>
                {email}
              </DrawerItem>
              <DrawerItem name={<Trans>Server</Trans>}>
                {server}
              </DrawerItem>
              {status.acme && (
                <DrawerItem name={<Trans>Status URI</Trans>}>
                  {status.acme.uri}
                </DrawerItem>
              )}
              <DrawerItem name={<Trans>Private Key Secret</Trans>}>
                {renderSecretLink(privateKeySecretRef.name)}
              </DrawerItem>
              <DrawerItem name={<Trans>Skip TLS Verify</Trans>}>
                {skipTLSVerify ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              </DrawerItem>
            </>
          )
        })()}

        {ca && (() => {
          const { secretName } = ca;
          return (
            <>
              <DrawerTitle title="CA"/>
              <DrawerItem name={<Trans>Secret Name</Trans>}>
                {renderSecretLink(secretName)}
              </DrawerItem>
            </>
          )
        })()}

        {vault && (() => {
          const { auth, caBundle, path, server } = vault;
          const { path: authPath, roleId, secretRef } = auth.appRole;
          return (
            <>
              <DrawerTitle title="Vault"/>
              <DrawerItem name={<Trans>Server</Trans>}>
                {server}
              </DrawerItem>
              <DrawerItem name={<Trans>Path</Trans>}>
                {path}
              </DrawerItem>
              <DrawerItem name={<Trans>CA Bundle</Trans>} labelsOnly>
                <Badge label={caBundle}/>
              </DrawerItem>

              <DrawerTitle title={<Trans>Auth App Role</Trans>}/>
              <DrawerItem name={<Trans>Path</Trans>}>
                {authPath}
              </DrawerItem>
              <DrawerItem name={<Trans>Role ID</Trans>}>
                {roleId}
              </DrawerItem>
              {secretRef && (
                <DrawerItem name={<Trans>Secret</Trans>}>
                  {renderSecretLink(secretRef.name)}
                </DrawerItem>
              )}
            </>
          )
        })()}

        {venafi && (() => {
          const { zone, cloud, tpp } = venafi;
          return (
            <>
              <DrawerTitle title="CA"/>
              <DrawerItem name={<Trans>Zone</Trans>}>
                {zone}
              </DrawerItem>
              {cloud && (
                <DrawerItem name={<Trans>Cloud API Token Secret</Trans>}>
                  {renderSecretLink(cloud.apiTokenSecretRef.name)}
                </DrawerItem>
              )}
              {tpp && (
                <>
                  <DrawerTitle title="TPP"/>
                  <DrawerItem name={<Trans>URL</Trans>}>
                    {tpp.url}
                  </DrawerItem>
                  <DrawerItem name={<Trans>CA Bundle</Trans>} labelsOnly>
                    <Badge label={tpp.caBundle}/>
                  </DrawerItem>
                  <DrawerItem name={<Trans>Credentials Ref</Trans>}>
                    {renderSecretLink(tpp.credentialsRef.name)}
                  </DrawerItem>
                </>
              )}
            </>
          )
        })()}

        <KubeEventDetails object={issuer}/>
      </div>
    );
  }
}

apiManager.registerViews([issuersApi, clusterIssuersApi], {
  Details: IssuerDetails
})
