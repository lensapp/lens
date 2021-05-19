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

import "./namespace-details.scss";

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { limitRangeApi, Namespace, resourceQuotaApi } from "../../api/endpoints";
import { getDetailsUrl, KubeObjectDetailsProps } from "../kube-object";
import { Link } from "react-router-dom";
import { Spinner } from "../spinner";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { ApiManager } from "../../api/api-manager";
import type { ResourceQuotasStore } from "../+config-resource-quotas";
import type { LimitRangesStore } from "../+config-limit-ranges";

interface Props extends KubeObjectDetailsProps<Namespace> {
}

@observer
export class NamespaceDetails extends React.Component<Props> {
  private get resourceQuotaStore() {
    return ApiManager.getInstance().getStore<ResourceQuotasStore>(resourceQuotaApi);
  }

  private get limitRangeStore() {
    return ApiManager.getInstance().getStore<LimitRangesStore>(limitRangeApi);
  }

  @computed get quotas() {
    const namespace = this.props.object.getName();

    return this.resourceQuotaStore.getAllByNs(namespace);
  }

  @computed get limitranges() {
    const namespace = this.props.object.getName();

    return this.limitRangeStore.getAllByNs(namespace);
  }

  componentDidMount() {
    this.resourceQuotaStore.reloadAll();
    this.limitRangeStore.reloadAll();
  }

  render() {
    const { object: namespace } = this.props;

    if (!namespace) return null;
    const status = namespace.getStatus();

    return (
      <div className="NamespaceDetails">
        <KubeObjectMeta object={namespace}/>

        <DrawerItem name="Status">
          <span className={cssNames("status", status.toLowerCase())}>{status}</span>
        </DrawerItem>

        <DrawerItem name="Resource Quotas" className="quotas flex align-center">
          {!this.quotas && this.resourceQuotaStore.isLoading && <Spinner/>}
          {this.quotas.map(quota => {
            return (
              <Link key={quota.getId()} to={getDetailsUrl(quota.selfLink)}>
                {quota.getName()}
              </Link>
            );
          })}
        </DrawerItem>
        <DrawerItem name="Limit Ranges">
          {!this.limitranges && this.limitRangeStore.isLoading && <Spinner/>}
          {this.limitranges.map(limitrange => {
            return (
              <Link key={limitrange.getId()} to={getDetailsUrl(limitrange.selfLink)}>
                {limitrange.getName()}
              </Link>
            );
          })}
        </DrawerItem>
      </div>
    );
  }
}
