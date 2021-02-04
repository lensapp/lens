import { Component } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { SurveyPreferencesStore } from "./survey-preferences-store";

@observer
export class SurveyPreferenceInput extends React.Component<{survey: SurveyPreferencesStore}, {}> {
  render() {
    const { survey } = this.props;

    return (
      <Component.Checkbox
        label="Allow in-app surveys"
        value={survey.enabled}
        onChange={v => survey.enabled = v }
      />
    );
  }
}

export class SurveyPreferenceHint extends React.Component {
  render() {
    return (
      <span>This will allow you to participate in surveys to improve the Lens experience.</span>
    );
  }
}
