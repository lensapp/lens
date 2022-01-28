/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+pods/details-statuses";
import { Link } from "react-router-dom";
import { PodDetailsTolerations } from "../+pods/details-tolerations";
import { PodDetailsAffinities } from "../+pods/details-affinities";
import type { PodStore } from "../+pods/store";
import type { JobStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForJobs, IPodMetrics, Job } from "../../../common/k8s-api/endpoints";
import { PodDetailsList } from "../+pods/details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { reaction } from "mobx";
import { podMetricTabs, PodCharts } from "../+pods/charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { ResourceMetrics } from "../resource-metrics";
import { getDetailsUrl } from "../kube-detail-params";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import { disposer } from "../../utils";
import podStoreInjectable from "../+pods/store.injectable";
import jobStoreInjectable from "./store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface JobDetailsProps extends KubeObjectDetailsProps<Job> {
}

interface Dependencies {
  apiManager: ApiManager;
  kubeWatchApi: KubeWatchApi;
  podStore: PodStore;
  jobStore: JobStore;
  isMetricHidden: boolean;
}

const NonInjectedJobDetails = observer(({ isMetricHidden, apiManager, object: job, kubeWatchApi, podStore, jobStore }: Dependencies & JobDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);

  if (!job) {
    return null;
  }

  if (!(job instanceof Job)) {
    logger.error("[JobDetails]: passed object that is not an instanceof Job", job);

    return null;
  }

  useEffect(() => disposer(
    reaction(() => job, () => setMetrics(null)),
    kubeWatchApi.subscribeStores([
      podStore,
    ]),
  ), []);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForJobs([job], job.getNs(), ""));
  };

  const selectors = job.getSelectors();
  const nodeSelector = job.getNodeSelectors();
  const images = job.getImages();
  const childPods = jobStore.getChildPods(job);
  const ownerRefs = job.getOwnerRefs();
  const condition = job.getCondition();

  return (
    <div className="JobDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={job}
          metrics={metrics}
        >
          <PodCharts />
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={job}/>
      <DrawerItem name="Selector" labelsOnly>
        {
          Object.keys(selectors).map(label => <Badge key={label} label={label}/>)
        }
      </DrawerItem>
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
      }
      {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
      }
      {ownerRefs.length > 0 &&
        <DrawerItem name="Controlled by">
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const detailsUrl = getDetailsUrl(apiManager.lookupApiLink(ref, job));

              return (
                <p key={name}>
                  {kind} <Link to={detailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
      }
      <DrawerItem name="Conditions" className="conditions" labelsOnly>
        {condition && (
          <Badge
            className={kebabCase(condition.type)}
            label={condition.type}
            tooltip={condition.message}
          />
        )}
      </DrawerItem>
      <DrawerItem name="Completions">
        {job.getDesiredCompletions()}
      </DrawerItem>
      <DrawerItem name="Parallelism">
        {job.getParallelism()}
      </DrawerItem>
      <PodDetailsTolerations workload={job}/>
      <PodDetailsAffinities workload={job}/>
      <DrawerItem name="Pod Status" className="pod-status">
        <PodDetailsStatuses pods={childPods}/>
      </DrawerItem>
      <PodDetailsList
        pods={childPods}
        owner={job}
        isLoaded={podStore.isLoaded}
      />
    </div>
  );
});

export const JobDetails = withInjectables<Dependencies, JobDetailsProps>(NonInjectedJobDetails, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    podStore: di.inject(podStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Job,
    }),
    ...props,
  }),
});
