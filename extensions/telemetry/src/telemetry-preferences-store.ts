import { Store } from "@k8slens/extensions";
import { toJS } from "mobx";

export type TelemetryPreferencesModel = {
  enabled: boolean;
};

export class TelemetryPreferencesStore extends Store.ExtensionStore<TelemetryPreferencesModel> {
  enabled = true;

  private constructor() {
    super({
      configName: "preferences-store",
      defaults: {
        enabled: true
      }
    });
  }

  protected fromStore({ enabled }: TelemetryPreferencesModel): void {
    this.enabled = enabled;
  }

  toJSON(): TelemetryPreferencesModel {
    return toJS({
      enabled: this.enabled
    }, {
      recurseEverything: true
    });
  }
}

export const telemetryPreferencesStore = TelemetryPreferencesStore.getInstance<TelemetryPreferencesStore>();
