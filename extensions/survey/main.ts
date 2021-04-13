import { LensMainExtension } from "@k8slens/extensions";
import { surveyPreferencesStore } from "./src/survey-preferences-store";

export default class SurveyMainExtension extends LensMainExtension {

  async onActivate() {
    await surveyPreferencesStore.loadExtension(this);
  }
}
