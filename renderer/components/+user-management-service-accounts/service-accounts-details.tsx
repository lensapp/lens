import "./service-accounts-details.scss";

import React from "react";
import { autorun, observable } from "mobx";
import { Trans } from "@lingui/macro";
import { Spinner } from "../spinner";
import { ServiceAccountsSecret } from "./service-accounts-secret";
import { DrawerItem, DrawerTitle } from "../drawer";
import { disposeOnUnmount, observer } from "mobx-react";
import { secretsStore } from "../+config-secrets/secrets.store";
import { Link } from "react-router-dom";
import { Secret, ServiceAccount, serviceAccountsApi } from "../../api/endpoints";
import { KubeEventDetails } from "../+events/kube-event-details";
import { getDetailsUrl } from "../../navigation";
import { KubeObjectDetailsProps } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<ServiceAccount> {
}

@observer
export class ServiceAccountsDetails extends React.Component<Props> {
  @observable secrets: Secret[];

  @disposeOnUnmount
  loadSecrets = autorun(async () => {
    this.secrets = null;
    const { object: serviceAccount } = this.props;
    if (!serviceAccount) {
      return;
    }
    const namespace = serviceAccount.getNs();
    const secrets = serviceAccount.getSecrets().map(({ name }) => {
      const secret = secretsStore.getByName(name, namespace);
      if (!secret) return secretsStore.load({ name, namespace });
      return secret;
    });
    this.secrets = await Promise.all(secrets);
  })

  renderSecrets() {
    const { secrets } = this;
    if (!secrets) {
      return <Spinner center/>
    }
    return secrets.map(secret =>
      <ServiceAccountsSecret key={secret.getId()} secret={secret}/>
    )
  }

  renderSecretLinks(secrets: Secret[]) {
    return secrets.map(secret => {
      return (
        <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
          {secret.getName()}
        </Link>
      )
    }
    )
  }

  render() {
    const { object: serviceAccount } = this.props;
    if (!serviceAccount) {
      return null;
    }
    const tokens = secretsStore.items.filter(secret =>
      secret.getNs() == serviceAccount.getNs() &&
      secret.getAnnotations().some(annot => annot == `kubernetes.io/service-account.name: ${serviceAccount.getName()}`)
    )
    const imagePullSecrets = serviceAccount.getImagePullSecrets().map(({ name }) =>
      secretsStore.getByName(name, serviceAccount.getNs())
    )
    return (
      <div className="ServiceAccountsDetails">
        <KubeObjectMeta object={serviceAccount}/>

        {tokens.length > 0 &&
        <DrawerItem name={<Trans>Tokens</Trans>} className="links">
          {this.renderSecretLinks(tokens)}
        </DrawerItem>
        }
        {imagePullSecrets.length > 0 &&
        <DrawerItem name={<Trans>ImagePullSecrets</Trans>} className="links">
          {this.renderSecretLinks(imagePullSecrets)}
        </DrawerItem>
        }

        <DrawerTitle title={<Trans>Mountable secrets</Trans>}/>
        <div className="secrets">
          {this.renderSecrets()}
        </div>

        <KubeEventDetails object={serviceAccount}/>
      </div>
    )
  }
}

apiManager.registerViews(serviceAccountsApi, {
  Details: ServiceAccountsDetails
})