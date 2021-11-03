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

import "./details.scss";

import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Link } from "react-router-dom";

import { secretsStore } from "../../+config-secrets/secrets.store";
import { Secret, SecretType, ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Icon } from "../../icon";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Spinner } from "../../spinner";
import { ServiceAccountsSecret } from "./secret";
import { getDetailsUrl } from "../../kube-detail-params";

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
    const imagePullSecrets = serviceAccount.getImagePullSecrets().map(async ({ name }) => {
      return secretsStore.load({ name, namespace }).catch(() => this.generateDummySecretObject(name));
    });

    this.imagePullSecrets = await Promise.all(imagePullSecrets);
  });

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  renderSecrets() {
    const { secrets } = this;

    if (!secrets) {
      return <Spinner center/>;
    }

    return secrets.map(secret =>
      <ServiceAccountsSecret key={secret.getId()} secret={secret}/>,
    );
  }

  renderImagePullSecrets() {
    const { imagePullSecrets } = this;

    if (!imagePullSecrets) {
      return <Spinner center/>;
    }

    return this.renderSecretLinks(imagePullSecrets);
  }

  renderSecretLinks(secrets: Secret[]) {
    return secrets.map((secret) => {
      if (secret.getId() === null) {
        return (
          <div key={secret.getName()}>
            {secret.getName()}
            <Icon
              small material="warning"
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

  generateDummySecretObject(name: string) {
    return new Secret({
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name,
        uid: null,
        selfLink: null,
        resourceVersion: null,
      },
      type: SecretType.Opaque,
    });
  }

  render() {
    const { object: serviceAccount } = this.props;

    if (!serviceAccount) {
      return null;
    }
    const tokens = secretsStore.items.filter(secret =>
      secret.getNs() == serviceAccount.getNs() &&
      secret.getAnnotations().some(annot => annot == `kubernetes.io/service-account.name: ${serviceAccount.getName()}`),
    );
    const imagePullSecrets = serviceAccount.getImagePullSecrets();

    return (
      <div className="ServiceAccountsDetails">
        <KubeObjectMeta object={serviceAccount}/>

        {tokens.length > 0 &&
        <DrawerItem name="Tokens" className="links">
          {this.renderSecretLinks(tokens)}
        </DrawerItem>
        }
        {imagePullSecrets.length > 0 &&
        <DrawerItem name="ImagePullSecrets" className="links">
          {this.renderImagePullSecrets()}
        </DrawerItem>
        }

        <DrawerTitle title="Mountable secrets"/>
        <div className="secrets">
          {this.renderSecrets()}
        </div>
      </div>
    );
  }
}
