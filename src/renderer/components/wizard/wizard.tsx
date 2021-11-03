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

import "./wizard.scss";
import React from "react";
import { cssNames, prevDefault } from "../../utils";
import { Button } from "../button";
import { Stepper } from "../stepper";
import { SubTitle } from "../layout/sub-title";
import { Spinner } from "../spinner";

interface WizardCommonProps<D = any> {
  data?: Partial<D>;
  save?: (data: Partial<D>, callback?: () => void) => void;
  reset?: () => void;
  done?: () => void;
  hideSteps?: boolean;
}

export interface WizardProps extends WizardCommonProps {
  className?: string;
  step?: number;
  title?: string;
  header?: React.ReactNode;
  onChange?: (step: number) => void;
}

interface State {
  step?: number;
}

export class Wizard extends React.Component<WizardProps, State> {
  public state: State = {
    step: this.getValidStep(this.props.step),
  };

  get steps() {
    const { className, title, step, header, onChange, children, ...commonProps } = this.props;
    const steps = React.Children.toArray(children) as WizardStepElem[];

    return steps.filter(step => !step.props.skip).map((stepElem, i) => {
      const stepProps = stepElem.props;

      return React.cloneElement(stepElem, {
        step: i + 1,
        wizard: this,
        next: this.nextStep,
        prev: this.prevStep,
        first: this.firstStep,
        last: this.lastStep,
        isFirst: this.isFirstStep,
        isLast: this.isLastStep,
        ...commonProps,
        ...stepProps,
      } as WizardStepProps<any>);
    });
  }

  get step() {
    return this.state.step;
  }

  set step(step: number) {
    step = this.getValidStep(step);
    if (step === this.step) return;

    this.setState({ step }, () => {
      if (this.props.onChange) {
        this.props.onChange(step);
      }
    });
  }

  protected getValidStep(step: number) {
    return Math.min(Math.max(1, step), this.steps.length) || 1;
  }

  isFirstStep = () => this.step === 1;
  isLastStep = () => this.step === this.steps.length;
  firstStep = (): any => this.step = 1;
  nextStep = (): any => this.step++;
  prevStep = (): any => this.step--;
  lastStep = (): any => this.step = this.steps.length;

  render() {
    const { className, title, header, hideSteps } = this.props;
    const steps = this.steps.map(stepElem => ({ title: stepElem.props.title }));
    const step = React.cloneElement(this.steps[this.step - 1]);

    return (
      <div className={cssNames("Wizard", className)}>
        <div className="header">
          {header}
          {title ? <SubTitle title={title}/> : null}
          {!hideSteps && steps.length > 1 ? <Stepper steps={steps} step={this.step}/> : null}
        </div>
        {step}
      </div>
    );
  }
}

export interface WizardStepProps<D = any> extends WizardCommonProps<D> {
  wizard?: Wizard;
  title?: string;
  className?: string | object;
  contentClass?: string | object;
  customButtons?: React.ReactNode; // render custom buttons block in footer
  moreButtons?: React.ReactNode; // add more buttons to section in the footer
  loading?: boolean; // indicator of loading content for the step
  waiting?: boolean; // indicator of waiting response before going to next step
  disabledNext?: boolean; // disable next button flag, e.g when filling step is not finished
  hideNextBtn?: boolean;
  hideBackBtn?: boolean;
  step?: number;
  prevLabel?: React.ReactNode; // custom label for prev button
  nextLabel?: React.ReactNode; // custom label for next button
  next?: () => void | boolean | Promise<any>; // custom action for next button
  prev?: () => void; // custom action for prev button
  first?: () => void;
  last?: () => void;
  isFirst?: () => boolean;
  isLast?: () => boolean;
  beforeContent?: React.ReactNode;
  afterContent?: React.ReactNode;
  noValidate?: boolean; // no validate form attribute
  skip?: boolean; // don't render the step
  scrollable?: boolean;
}

interface WizardStepState {
  waiting?: boolean;
}

type WizardStepElem = React.ReactElement<WizardStepProps>;

export class WizardStep extends React.Component<WizardStepProps, WizardStepState> {
  private form: HTMLFormElement;
  public state: WizardStepState = {};
  private unmounting = false;

  static defaultProps: WizardStepProps = {
    scrollable: true,
  };

  componentWillUnmount() {
    this.unmounting = true;
  }

  prev = () => {
    const { isFirst, prev, done } = this.props;

    if (isFirst() && done) done();
    else prev();
  };

  next = () => {
    const next = this.props.next;
    const nextStep = this.props.wizard.nextStep;

    if (nextStep !== next) {
      const result = next();

      if (result instanceof Promise) {
        this.setState({ waiting: true });
        result.then(nextStep).finally(() => {
          if (this.unmounting) return;
          this.setState({ waiting: false });
        });
      }
      else if (typeof result === "boolean" && result) {
        nextStep();
      }
    }
    else {
      nextStep();
    }
  };

  submit = () => {
    if (!this.form.noValidate) {
      const valid = this.form.checkValidity();

      if (!valid) return;
    }
    this.next();
  };

  renderLoading() {
    return (
      <div className="step-loading flex center">
        <Spinner/>
      </div>
    );
  }

  render() {
    const {
      step, isFirst, isLast, children,
      loading, customButtons, disabledNext, scrollable,
      hideNextBtn, hideBackBtn, beforeContent, afterContent, noValidate, skip, moreButtons,
    } = this.props;
    let { className, contentClass, nextLabel, prevLabel, waiting } = this.props;

    if (skip) {
      return null;
    }
    waiting = (waiting !== undefined) ? waiting : this.state.waiting;
    className = cssNames(`WizardStep step${step}`, className);
    contentClass = cssNames("step-content", { scrollable }, contentClass);
    prevLabel = prevLabel || (isFirst() ? "Cancel" : "Back");
    nextLabel = nextLabel || (isLast() ? "Submit" : "Next");

    return (
      <form className={className}
        onSubmit={prevDefault(this.submit)} noValidate={noValidate}
        ref={e => this.form = e}>
        {beforeContent}
        <div className={contentClass}>
          {loading ? this.renderLoading() : children}
        </div>
        {customButtons !== undefined ? customButtons : (
          <div className="buttons flex gaps align-center">
            {moreButtons}
            <Button
              className="back-btn"
              plain label={prevLabel} hidden={hideBackBtn}
              onClick={this.prev}
            />
            <Button
              primary type="submit"
              label={nextLabel} hidden={hideNextBtn}
              waiting={waiting} disabled={disabledNext}
            />
          </div>
        )}
        {afterContent}
      </form>
    );
  }
}
