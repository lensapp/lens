import { Util } from "@k8slens/extensions";
import { machineIdSync } from "node-machine-id";
import Refiner from "refiner-js";

export class Survey extends Util.Singleton {
  static readonly PROJECT_ID = "12a3b8f0-4f5e-11eb-84d0-212af0117cc2";
  protected anonymousId: string;

  private constructor() {
    super();
    this.anonymousId = machineIdSync();
  }

  start() {
    Refiner("setProject", Survey.PROJECT_ID);
    Refiner("identifyUser", {
      id: this.anonymousId,
    });
  }
}

export const survey = Survey.getInstance<Survey>();