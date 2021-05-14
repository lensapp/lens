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
import * as routes from "../../../common/routes";

commandRegistry.add({
  id: "cluster.viewConfigMaps",
  title: "Cluster: View ConfigMaps",
  scope: "entity",
  action: () => navigate(routes.configMapsURL())
});

commandRegistry.add({
  id: "cluster.viewSecrets",
  title: "Cluster: View Secrets",
  scope: "entity",
  action: () => navigate(routes.secretsURL())
});

commandRegistry.add({
  id: "cluster.viewResourceQuotas",
  title: "Cluster: View ResourceQuotas",
  scope: "entity",
  action: () => navigate(routes.resourceQuotaURL())
});

commandRegistry.add({
  id: "cluster.viewLimitRanges",
  title: "Cluster: View LimitRanges",
  scope: "entity",
  action: () => navigate(routes.limitRangeURL())
});

commandRegistry.add({
  id: "cluster.viewHorizontalPodAutoscalers",
  title: "Cluster: View HorizontalPodAutoscalers (HPA)",
  scope: "entity",
  action: () => navigate(routes.hpaURL())
});

commandRegistry.add({
  id: "cluster.viewPodDisruptionBudget",
  title: "Cluster: View PodDisruptionBudgets",
  scope: "entity",
  action: () => navigate(routes.pdbURL())
});
