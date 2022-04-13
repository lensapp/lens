/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { autorun, observable, runInAction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Link } from "react-router-dom";

import { secretStore } from "../../+config-secrets/legacy-store";
import type { Secret, ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Icon } from "../../icon";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Spinner } from "../../spinner";
import { ServiceAccountsSecret } from "./secret";
import { getDetailsUrl } from "../../kube-detail-params";

export interface ServiceAccountsDetailsProps extends KubeObjectDetailsProps<ServiceAccount> {
}

const defensiveLoadSecretIn = (namespace: string) => (
  ({ name }: { name: string }) => (
    secretStore.load({ name, namespace })
      .catch(() => name)
  )
);

@observer
export class ServiceAccountsDetails extends React.Component<ServiceAccountsDetailsProps> {
  readonly secrets = observable.array<Secret | string>();
  readonly imagePullSecrets = observable.array<Secret | string>();

  componentDidMount(): void {
    disposeOnUnmount(this, [
      autorun(async () => {
        runInAction(() => {
          this.secrets.clear();
          this.imagePullSecrets.clear();
        });

        const { object: serviceAccount } = this.props;
        const namespace = serviceAccount?.getNs();

        if (!namespace) {
          return;
        }

        const defensiveLoadSecret = defensiveLoadSecretIn(namespace);

        const secretLoaders = Promise.all(serviceAccount.getSecrets().map(defensiveLoadSecret));
        const imagePullSecretLoaders = Promise.all(serviceAccount.getImagePullSecrets().map(defensiveLoadSecret));
        const [secrets, imagePullSecrets] = await Promise.all([
          secretLoaders,
          imagePullSecretLoaders,
        ]);

        runInAction(() => {
          this.secrets.replace(secrets);
          this.imagePullSecrets.replace(imagePullSecrets);
        });
      }),
    ]);
  }

  renderSecrets() {
    const { secrets } = this;

    if (!secrets) {
      return <Spinner center/>;
    }

    return secrets.map(secret => (
      <ServiceAccountsSecret
        key={typeof secret === "string" ? secret : secret.getName()}
        secret={secret}
      />
    ));
  }

  renderImagePullSecrets() {
    const { imagePullSecrets } = this;

    if (!imagePullSecrets) {
      return <Spinner center/>;
    }

    return this.renderSecretLinks(imagePullSecrets);
  }

  renderSecretLinks(secrets: (Secret | string)[]) {
    return secrets.map((secret) => {
      if (typeof secret === "string") {
        return (
          <div key={secret}>
            {secret}
            <Icon
              small
              material="warning"
              tooltip="Secret is not found"
            />
          </div>
        );
      }

      return (
        <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
          {secret.getName()}
        </Link>
      );
    });
  }

  render() {
    const { object: serviceAccount } = this.props;

    if (!serviceAccount) {
      return null;
    }
    const tokens = secretStore.items.filter(secret =>
      secret.getNs() == serviceAccount.getNs() &&
      secret.getAnnotations().some(annot => annot == `kubernetes.io/service-account.name: ${serviceAccount.getName()}`),
    );
    const imagePullSecrets = serviceAccount.getImagePullSecrets();

    return (
      <div className="ServiceAccountsDetails">
        <KubeObjectMeta object={serviceAccount}/>

        {tokens.length > 0 && (
          <DrawerItem name="Tokens" className="links">
            {this.renderSecretLinks(tokens)}
          </DrawerItem>
        )}
        {imagePullSecrets.length > 0 && (
          <DrawerItem name="ImagePullSecrets" className="links">
            {this.renderImagePullSecrets()}
          </DrawerItem>
        )}

        <DrawerTitle>Mountable secrets</DrawerTitle>
        <div className="secrets">
          {this.renderSecrets()}
        </div>
      </div>
    );
  }
}
