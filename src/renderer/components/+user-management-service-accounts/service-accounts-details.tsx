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
import { Icon } from "../icon";

interface Props extends KubeObjectDetailsProps<ServiceAccount> {
}

@observer
export class ServiceAccountsDetails extends React.Component<Props> {
  @observable secrets: Secret[];
  @observable imagePullSecrets: Secret[];

  @disposeOnUnmount
  loadSecrets = autorun(async () => {
    this.secrets = null;
    this.imagePullSecrets = null;
    const { object: serviceAccount } = this.props;
    if (!serviceAccount) {
      return;
    }
    const namespace = serviceAccount.getNs();
    const secrets = serviceAccount.getSecrets().map(({ name }) => {
      return secretsStore.load({ name, namespace });
    });
    this.secrets = await Promise.all(secrets);
    const imagePullSecrets = serviceAccount.getImagePullSecrets().map(async({ name }) => {
      return secretsStore.load({ name, namespace }).catch(_err => { return null });
    });
    this.imagePullSecrets = (await Promise.all(imagePullSecrets)).filter(secret => !!secret)
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

  renderImagePullSecrets(imagePullSecretNames: { name: string; }[]) {
    const { object: serviceAccount } = this.props;
    const { imagePullSecrets } = this;
    if (!imagePullSecrets) {
      return <Spinner center/>
    }
    const secrets = imagePullSecretNames.map(({name}) => {
      let secret = imagePullSecrets.find((secret) => secret.getName() === name && secret.getNs() === serviceAccount.getNs())
      if (!secret) {
        secret = this.generateDummySecretObject(name, serviceAccount.getNs())
      }
      return secret
    })

    return this.renderSecretLinks(secrets)
  }

  renderSecretLinks(secrets: Secret[]) {
    return secrets.map((secret) => {
      if (secret.getId() === null) {
        return (
          <div key={secret.getName()}>
            {secret.getName()}
            <Icon
              small material="warning"
              tooltip={<Trans>Secret is not found</Trans>}
            />
         </div>
        )
      }
      return (
        <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
          {secret.getName()}
        </Link>
      )
    })
  }

  generateDummySecretObject(name: string, namespace: string) {
    return new Secret({
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        namespace: namespace,
        name: name,
        uid: null,
        selfLink: null,
        resourceVersion: null
      }
    })
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
    const imagePullSecrets = serviceAccount.getImagePullSecrets()
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
          {this.renderImagePullSecrets(imagePullSecrets)}
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