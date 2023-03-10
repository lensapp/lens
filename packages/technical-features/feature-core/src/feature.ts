import type { DiContainerForInjection } from "@ogre-tools/injectable";

export interface Feature {
  id: string;
  register: (di: DiContainerForInjection) => void;
  dependencies?: Feature[];
}

export interface GetFeatureArgs extends Feature {}

export const getFeature = (getFeatureArgs: GetFeatureArgs): Feature => getFeatureArgs;
