import { Store } from "@k8slens/extensions";
import { observable, toJS, when } from "mobx";

export type SurveyPreferencesModel = {
  enabled: boolean;
};

export class SurveyPreferencesStore extends Store.ExtensionStore<SurveyPreferencesModel> {

  @observable enabled = true;

  whenEnabled = when(() => this.enabled);

  private constructor() {
    super({
      configName: "preferences-store",
      defaults: {
        enabled: true
      }
    });
  }

  protected fromStore({ enabled }: SurveyPreferencesModel): void {
    this.enabled = enabled;
  }

  toJSON(): SurveyPreferencesModel {
    return toJS({
      enabled: this.enabled
    }, {
      recurseEverything: true
    });
  }
}

export const surveyPreferencesStore = SurveyPreferencesStore.getInstance<SurveyPreferencesStore>();
