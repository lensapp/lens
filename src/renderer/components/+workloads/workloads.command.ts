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

import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { cronJobsURL, daemonSetsURL, deploymentsURL, jobsURL, podsURL, statefulSetsURL } from "./workloads.route";

commandRegistry.add({
  id: "cluster.viewPods",
  title: "Cluster: View Pods",
  scope: "entity",
  action: () => navigate(podsURL())
});

commandRegistry.add({
  id: "cluster.viewDeployments",
  title: "Cluster: View Deployments",
  scope: "entity",
  action: () => navigate(deploymentsURL())
});

commandRegistry.add({
  id: "cluster.viewDaemonSets",
  title: "Cluster: View DaemonSets",
  scope: "entity",
  action: () => navigate(daemonSetsURL())
});

commandRegistry.add({
  id: "cluster.viewStatefulSets",
  title: "Cluster: View StatefulSets",
  scope: "entity",
  action: () => navigate(statefulSetsURL())
});

commandRegistry.add({
  id: "cluster.viewJobs",
  title: "Cluster: View Jobs",
  scope: "entity",
  action: () => navigate(jobsURL())
});

commandRegistry.add({
  id: "cluster.viewCronJobs",
  title: "Cluster: View CronJobs",
  scope: "entity",
  action: () => navigate(cronJobsURL())
});
