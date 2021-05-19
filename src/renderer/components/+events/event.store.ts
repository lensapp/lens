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

import groupBy from "lodash/groupBy";
import compact from "lodash/compact";
import { KubeObjectStore } from "../../kube-object.store";
import { autoBind } from "../../utils";
import { eventApi, KubeEvent } from "../../api/endpoints/events.api";
import type { KubeObject } from "../../api/kube-object";
import { Pod } from "../../api/endpoints/pods.api";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";

export class EventStore extends KubeObjectStore<KubeEvent> {
  api = eventApi;
  limit = 1000;
  saveLimit = 50000;

  constructor() {
    super();
    autoBind(this);
  }

  protected bindWatchEventsUpdater() {
    return super.bindWatchEventsUpdater(5000);
  }

  protected sortItems(items: KubeEvent[]) {
    return super.sortItems(items, [
      event => event.getTimeDiffFromNow(), // keep events order as timeline ("fresh" on top)
    ], "asc");
  }

  getEventsByObject(obj: KubeObject): KubeEvent[] {
    return this.items.filter(evt => {
      if(obj.kind == "Node") {
        return obj.getName() == evt.involvedObject.uid && evt.involvedObject.kind == "Node";
      }

      return obj.getId() == evt.involvedObject.uid;
    });
  }

  getWarnings() {
    const warnings = this.items.filter(event => event.type == "Warning");
    const groupsByInvolvedObject = groupBy(warnings, warning => warning.involvedObject.uid);
    const eventsWithError = Object.values(groupsByInvolvedObject).map(events => {
      const recent = events[0];
      const { kind, uid } = recent.involvedObject;

      if (kind == Pod.kind) {  // Wipe out running pods
        const pod = podsStore.items.find(pod => pod.getId() == uid);

        if (!pod || (!pod.hasIssues() && pod.spec.priority < 500000)) return undefined;
      }

      return recent;
    });

    return compact(eventsWithError);
  }

  getWarningsCount() {
    return this.getWarnings().length;
  }
}

export const eventStore = new EventStore();
apiManager.registerStore(eventStore);
