import { LensRendererExtension } from "@k8slens/extensions";
import { survey } from "./src/survey";

export default class SurveyRendererExtension extends LensRendererExtension {
  async onActivate() {
    survey.start();
  }
}
