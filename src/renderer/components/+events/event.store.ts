import groupBy from "lodash/groupBy";
import compact from "lodash/compact";
import { KubeObjectStore } from "../../kube-object.store";
import { autoBind } from "../../utils";
import { eventApi, KubeEvent } from "../../api/endpoints/events.api";
import { KubeObject } from "../../api/kube-object";
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

        if (!pod || (!pod.hasIssues() && pod.spec.priority < 500000)) return;
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
