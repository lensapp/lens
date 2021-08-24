/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { action, makeObservable, observable, reaction } from "mobx";
import { navigation } from "../renderer/navigation";
import { BaseStore } from "./base-store";
import { toJS } from "./utils";

type HistoryModel = {
  activeStep: number
};

export class HistoryStore extends BaseStore<HistoryModel> {
  @observable activeStep = 0;

  constructor() {
    super({
      configName: "lens-history-store",
    });
    makeObservable(this);

    reaction(() => navigation.location, () => {
      console.log(
        `The current URL is ${navigation.location.pathname}${navigation.location.search}${navigation.location.hash}`
      );
      console.log(`The last navigation action was ${navigation.action}`);
      console.log(`Current activeStep ${this.activeStep}`);
      console.log(`Nav length ${navigation.length}`);

      if (!this.backOrForwardChange()) {
        ++this.activeStep;
      }
    });
  }

  @action
  goBack() {
    --this.activeStep;
    navigation.goBack();
  }

  @action
  goForward() {
    ++this.activeStep;
    navigation.goForward();
  }

  isPreviousExist() {
    return this.activeStep > 0;
  }

  isForwardExist() {
    return this.activeStep < navigation.length - 1;
  }

  backOrForwardChange() {
    return navigation.action == "POP";
  }

  @action
  protected fromStore(data: Partial<HistoryModel> = {}) {
    this.activeStep = data.activeStep || 0;
  }

  toJSON(): HistoryModel {
    const model: HistoryModel = {
      activeStep: this.activeStep
    };

    return toJS(model);
  }
}
