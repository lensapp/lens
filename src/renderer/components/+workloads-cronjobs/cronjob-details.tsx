/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cronjob-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge/badge";
import { jobStore } from "../+workloads-jobs/job.store";
import { Link } from "react-router-dom";
import { cronJobStore } from "./cronjob.store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getDetailsUrl } from "../kube-detail-params";
import type { Job } from "../../../common/k8s-api/endpoints";
import { CronJob } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface CronJobDetailsProps extends KubeObjectDetailsProps<CronJob> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
}

@observer
class NonInjectedCronJobDetails extends React.Component<CronJobDetailsProps & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        jobStore,
      ]),
    ]);
  }

  render() {
    const { object: cronJob } = this.props;

    if (!cronJob) {
      return null;
    }

    if (!(cronJob instanceof CronJob)) {
      logger.error("[CronJobDetails]: passed object that is not an instanceof CronJob", cronJob);

      return null;
    }

    const childJobs = jobStore.getJobsByOwner(cronJob);

    return (
      <div className="CronJobDetails">
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
        {childJobs.length > 0 && (
          <>
            <DrawerTitle>Jobs</DrawerTitle>
            {childJobs.map((job: Job) => {
              const selectors = job.getSelectors();
              const condition = job.getCondition();

              return (
                <div className="job" key={job.getId()}>
                  <div className="title">
                    <Link to={() => job.selfLink ? getDetailsUrl(job.selfLink) : ""}>
                      {job.getName()}
                    </Link>
                  </div>
                  <DrawerItem
                    name="Condition"
                    className="conditions"
                    labelsOnly
                  >
                    {condition && (
                      <Badge
                        label={condition.type}
                        className={kebabCase(condition.type)}
                      />
                    )}
                  </DrawerItem>
                  <DrawerItem name="Selector" labelsOnly>
                    {
                      selectors.map(label => <Badge key={label} label={label}/>)
                    }
                  </DrawerItem>
                </div>
              );})
            }
          </>
        )}
      </div>
    );
  }
}

export const CronJobDetails = withInjectables<Dependencies, CronJobDetailsProps>(NonInjectedCronJobDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
  }),
});
