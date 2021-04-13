import { Util } from "@k8slens/extensions";
import { machineId } from "node-machine-id";
import Refiner from "refiner-js";
import got from "got";
import { surveyPreferencesStore } from "./survey-preferences-store";

type SurveyIdResponse = {
  surveyId: string;
};
export class Survey extends Util.Singleton {
  static readonly PROJECT_ID = "af468d00-4f8f-11eb-b01d-23b6562fef43";
  protected anonymousId: string;

  private constructor() {
    super();
  }

  async start() {
    await surveyPreferencesStore.whenEnabled;

    const surveyId = await this.fetchSurveyId();

    if (surveyId) {
      Refiner("setProject", Survey.PROJECT_ID);
      Refiner("identifyUser", {
        id: surveyId,
      });

    }
  }

  async fetchSurveyId() {
    try {
      const surveyApi = process.env.SURVEY_API_URL || "https://survey.k8slens.dev";
      const anonymousId = await machineId();
      const { body } = await got(`${surveyApi}/api/survey-id?anonymousId=${anonymousId}`, { responseType: "json"});

      return (body as SurveyIdResponse).surveyId;
    } catch(error) {
      return null;
    }

  }
}

export const survey = Survey.getInstance<Survey>();
