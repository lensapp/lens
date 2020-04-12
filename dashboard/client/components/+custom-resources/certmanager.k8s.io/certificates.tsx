import "./certificates.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { KubeObjectMenu, KubeObjectMenuProps } from "../../kube-object/kube-object-menu";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../../kube-object";
import { Certificate, certificatesApi } from "../../../api/endpoints/cert-manager.api";
import { cssNames, stopPropagation } from "../../../utils";
import { Link } from "react-router-dom";
import { Badge } from "../../badge";
import { apiManager } from "../../../api/api-manager";
import { Spinner } from "../../spinner";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
  commonName = "common-name",
  secretName = "secret",
  issuer = "issuer",
  type = "type",
}

@observer
export class Certificates extends React.Component<KubeObjectListLayoutProps> {
  render() {
    const { store = apiManager.getStore(certificatesApi), ...layoutProps } = this.props;
    if (!store) {
      return <Spinner center/>
    }
    return (
      <KubeObjectListLayout
        {...layoutProps}
        store={store}
        className="Certificates"
        sortingCallbacks={{
          [sortBy.name]: (item: Certificate) => item.getName(),
          [sortBy.namespace]: (item: Certificate) => item.getNs(),
          [sortBy.secretName]: (item: Certificate) => item.getSecretName(),
          [sortBy.commonName]: (item: Certificate) => item.getCommonName(),
          [sortBy.issuer]: (item: Certificate) => item.getIssuerName(),
          [sortBy.type]: (item: Certificate) => item.getType(),
        }}
        searchFilters={[
          (item: Certificate) => item.getSearchFields(),
          (item: Certificate) => item.getSecretName(),
          (item: Certificate) => item.getCommonName(),
          (item: Certificate) => item.getIssuerName(),
          (item: Certificate) => item.getType(),
        ]}
        renderHeaderTitle={<Trans>Certificates</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Common Name</Trans>, className: "common-name", sortBy: sortBy.type },
          { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
          { title: <Trans>Issuer</Trans>, className: "issuer", sortBy: sortBy.issuer },
          { title: <Trans>Secret</Trans>, className: "secret", sortBy: sortBy.secretName },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status" },
        ]}
        renderTableContents={(cert: Certificate) => {
          return [
            cert.getName(),
            cert.getNs(),
            cert.getCommonName(),
            cert.getType(),
            <Link to={cert.getIssuerDetailsUrl()} onClick={stopPropagation}>
              {cert.getIssuerName()}
            </Link>,
            <Link to={cert.getSecretDetailsUrl()} onClick={stopPropagation}>
              {cert.getSecretName()}
            </Link>,
            cert.getAge(),
            cert.getConditions().map(({ type, tooltip, isReady }) => {
              return (
                <Badge
                  key={type}
                  label={type}
                  tooltip={tooltip}
                  className={cssNames({ [type.toLowerCase()]: isReady })}
                />
              )
            })
          ]
        }}
        renderItemMenu={(item: Certificate) => {
          return <CertificateMenu object={item}/>
        }}
      />
    );
  }
}

export function CertificateMenu(props: KubeObjectMenuProps<Certificate>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(certificatesApi, {
  List: Certificates,
  Menu: CertificateMenu
})
