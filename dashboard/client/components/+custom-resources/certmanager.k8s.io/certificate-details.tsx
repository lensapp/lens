import "./certificate-details.scss"

import React from "react";
import moment from "moment"
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { KubeEventDetails } from "../../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../../kube-object";
import { Certificate, certificatesApi } from "../../../api/endpoints/cert-manager.api";
import { cssNames } from "../../../utils";
import { apiManager } from "../../../api/api-manager";
import { KubeObjectMeta } from "../../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Certificate> {
}

@observer
export class CertificateDetails extends React.Component<Props> {
  render() {
    const { object: cert, className } = this.props;
    if (!cert) return;
    const { spec, status } = cert;
    const { acme, isCA, commonName, secretName, dnsNames, duration, ipAddresses, keyAlgorithm, keySize, organization, renewBefore } = spec;
    const { lastFailureTime, notAfter } = status;
    return (
      <div className={cssNames("CertificateDetails", className)}>
        <KubeObjectMeta object={cert}/>

        <DrawerItem name={<Trans>Issuer</Trans>}>
          <Link to={cert.getIssuerDetailsUrl()}>
            {cert.getIssuerName()}
          </Link>
        </DrawerItem>

        <DrawerItem name={<Trans>Secret Name</Trans>}>
          <Link to={cert.getSecretDetailsUrl()}>
            {secretName}
          </Link>
        </DrawerItem>

        <DrawerItem name="CA">
          {isCA ? <Trans>Yes</Trans> : <Trans>No</Trans>}
        </DrawerItem>

        {commonName && (
          <DrawerItem name={<Trans>Common Name</Trans>}>
            {commonName}
          </DrawerItem>
        )}
        {dnsNames && (
          <DrawerItem name={<Trans>DNS names</Trans>} labelsOnly>
            {dnsNames.map(name => <Badge key={name} label={name}/>)}
          </DrawerItem>
        )}
        {ipAddresses && (
          <DrawerItem name={<Trans>IP addresses</Trans>}>
            {ipAddresses.join(", ")}
          </DrawerItem>
        )}
        {organization && (
          <DrawerItem name={<Trans>Organization</Trans>}>
            {organization.join(", ")}
          </DrawerItem>
        )}
        {duration && (
          <DrawerItem name={<Trans>Duration</Trans>}>
            {duration}
          </DrawerItem>
        )}
        {renewBefore && (
          <DrawerItem name={<Trans>Renew Before</Trans>}>
            {renewBefore}
          </DrawerItem>
        )}
        {keySize && (
          <DrawerItem name={<Trans>Key Size</Trans>}>
            {keySize}
          </DrawerItem>
        )}
        {keyAlgorithm && (
          <DrawerItem name={<Trans>Key Algorithm</Trans>}>
            {keyAlgorithm}
          </DrawerItem>
        )}

        <DrawerItem name={<Trans>Not After</Trans>}>
          {moment(notAfter).format("LLL")}
        </DrawerItem>

        {lastFailureTime && (
          <DrawerItem name={<Trans>Last Failure Time</Trans>}>
            {lastFailureTime}
          </DrawerItem>
        )}
        <DrawerItem name={<Trans>Status</Trans>} labelsOnly>
          {cert.getConditions().map(({ type, tooltip, isReady }) => {
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

        {acme && (
          <>
            <DrawerTitle title="ACME"/>
            {acme.config.map(({ domains, http01, dns01 }, index) => {
              return (
                <div key={index} className="acme-config">
                  <DrawerItem name={<Trans>Domains</Trans>} labelsOnly>
                    {domains.map(domain => <Badge key={domain} label={domain}/>)}
                  </DrawerItem>
                  <DrawerItem name={<Trans>Http01</Trans>}>
                    {Object.entries(http01).map(([key, val]) => `${key}: ${val}`)[0]}
                  </DrawerItem>
                  {dns01 && (
                    <DrawerItem name={<Trans>DNS Provider</Trans>} labelsOnly>
                      {dns01.provider}
                    </DrawerItem>
                  )}
                </div>
              )
            })}
          </>
        )}

        <KubeEventDetails object={cert}/>
      </div>
    );
  }
}

apiManager.registerViews(certificatesApi, {
  Details: CertificateDetails
})