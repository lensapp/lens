/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge/badge";
import type { JobStore } from "../+jobs/store";
import { Link } from "react-router-dom";
import type { CronJobStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getDetailsUrl } from "../kube-detail-params";
import { CronJob } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import jobStoreInjectable from "../+jobs/store.injectable";
import cronJobStoreInjectable from "./store.injectable";
import { cssNames } from "../../utils";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";

export interface CronJobDetailsProps extends KubeObjectDetailsProps<CronJob> {
}

interface Dependencies {
  jobStore: JobStore;
  cronJobStore: CronJobStore;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedCronJobDetails = observer(({ kubeWatchApi, jobStore, cronJobStore, className, object: cronJob }: Dependencies & CronJobDetailsProps) => {
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      jobStore,
    ])
  ), []);

  if (!cronJob) {
    return null;
  }

  if (!(cronJob instanceof CronJob)) {
    logger.error("[CronJobDetails]: passed object that is not an instanceof CronJob", cronJob);

    return null;
  }

  const childJobs = jobStore.getJobsByOwner(cronJob);

  return (
    <div className={cssNames("CronJobDetails", className)}>
      <KubeObjectMeta object={cronJob}/>
      <DrawerItem name="Schedule">
        {
          cronJob.isNeverRun()
            ? `never (${cronJob.getSchedule()})`
            : cronJob.getSchedule()
        }
      </DrawerItem>
      <DrawerItem name="Active">
        {cronJobStore.getActiveJobsNum(cronJob)}
      </DrawerItem>
      <DrawerItem name="Suspend">
        {cronJob.getSuspendFlag()}
      </DrawerItem>
      <DrawerItem name="Last schedule">
        {cronJob.getLastScheduleTime()}
      </DrawerItem>
      {childJobs.length > 0 &&
          <>
            <DrawerTitle title="Jobs"/>
            {childJobs.map(job => {
              const condition = job.getCondition();

              return (
                <div className="job" key={job.getId()}>
                  <div className="title">
                    <Link to={getDetailsUrl(job.selfLink)}>
                      {job.getName()}
                    </Link>
                  </div>
                  <DrawerItem name="Condition" className="conditions" labelsOnly>
                    {condition && (
                      <Badge
                        label={condition.type}
                        className={kebabCase(condition.type)}
                      />
                    )}
                  </DrawerItem>
                  <DrawerItem name="Selector" labelsOnly>
                    {
                      job.getSelectors().map(label => <Badge key={label} label={label}/>)
                    }
                  </DrawerItem>
                </div>
              );})
            }
          </>
      }
    </div>
  );
});

export const CronJobDetails = withInjectables<Dependencies, CronJobDetailsProps>(NonInjectedCronJobDetails, {
  getProps: (di, props) => ({
    jobStore: di.inject(jobStoreInjectable),
    cronJobStore: di.inject(cronJobStoreInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
