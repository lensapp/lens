import "./cronjob-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge/badge";
import { jobStore } from "../+workloads-jobs/job.store";
import { Link } from "react-router-dom";
import { KubeEventDetails } from "../+events/kube-event-details";
import { cronJobStore } from "./cronjob.store";
import { getDetailsUrl } from "../../navigation";
import { KubeObjectDetailsProps } from "../kube-object";
import { CronJob, Job } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<CronJob> {
}

@observer
export class CronJobDetails extends React.Component<Props> {
  async componentDidMount() {
    if (!jobStore.isLoaded) {
      jobStore.loadAll();
    }
  }

  render() {
    const { object: cronJob } = this.props;
    if (!cronJob) return null;
    const childJobs = jobStore.getJobsByOwner(cronJob)
    return (
      <div className="CronJobDetails">
        <KubeObjectMeta object={cronJob}/>
        <DrawerItem name={<Trans>Schedule</Trans>}>
          {cronJob.isNeverRun() ? (
            <>
              <Trans>never</Trans> ({cronJob.getSchedule()})
            </>
          ) : cronJob.getSchedule()}
        </DrawerItem>
        <DrawerItem name={<Trans>Active</Trans>}>
          {cronJobStore.getActiveJobsNum(cronJob)}
        </DrawerItem>
        <DrawerItem name={<Trans>Suspend</Trans>}>
          {cronJob.getSuspendFlag()}
        </DrawerItem>
        <DrawerItem name={<Trans>Last schedule</Trans>}>
          {cronJob.getLastScheduleTime()}
        </DrawerItem>
        {childJobs.length > 0 &&
          <>
            <DrawerTitle title={<Trans>Jobs</Trans>}/>
            {childJobs.map((job: Job) => {
              const selectors = job.getSelectors()
              const condition = job.getCondition()
              return (
                <div className="job" key={job.getId()}>
                  <div className="title">
                    <Link to={getDetailsUrl(job.selfLink)}>
                      {job.getName()}
                    </Link>
                  </div>
                  <DrawerItem name={<Trans>Condition</Trans>} className="conditions" labelsOnly>
                    {condition && (
                      <Badge
                        label={condition.type}
                        className={kebabCase(condition.type)}
                      />
                    )}
                  </DrawerItem>
                  <DrawerItem name={<Trans>Selector</Trans>} labelsOnly>
                    {
                      selectors.map(label => <Badge key={label} label={label}/>)
                    }
                  </DrawerItem>
                </div>
              )})
            }
          </>
        }
        <KubeEventDetails object={cronJob}/>
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "CronJob",
  apiVersions: ["batch/v1"],
  components: {
    Details: (props) => <CronJobDetails {...props} />
  }
})
