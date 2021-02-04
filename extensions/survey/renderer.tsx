import { LensRendererExtension } from "@k8slens/extensions";
import { survey } from "./src/survey";
import { SurveyPreferenceHint, SurveyPreferenceInput } from "./src/survey-preference";
import { surveyPreferencesStore } from "./src/survey-preferences-store";
import React from "react";

export default class SurveyRendererExtension extends LensRendererExtension {
  appPreferences = [
    {
      title: "In-App Surveys",
      components: {
        Hint: () => <SurveyPreferenceHint/>,
        Input: () => <SurveyPreferenceInput survey={surveyPreferencesStore}/>
      }
    }
  ];
  async onActivate() {
    await surveyPreferencesStore.loadExtension(this);
    survey.start();
  }
}
