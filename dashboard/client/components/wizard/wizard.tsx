import "./wizard.scss";
import * as React from "react";
import { Trans } from "@lingui/macro";
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
    step: this.getValidStep(this.props.step)
  };

  get steps(): React.ReactElement[] {
    const { 
      className: _className,
      title: _title,
      step: _step,
      header: _header,
      onChange: _onChange,
      children,
      ...commonProps } = this.props;
    const steps = React.Children.toArray(children) as WizardStepElem[];
    return steps
      .filter(step => !step.props.skip)
      .map((stepElem, i) => {
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
          ...stepProps
        });
      });
  }

  get step(): number {
    return this.state.step || 1;
  }

  set step(step: number) {
    step = this.getValidStep(step);
    if (step === this.step) {
      return;
    }

    this.setState({ step }, () => {
      if (this.props.onChange) {
        this.props.onChange(step);
      }
    });
  }

  protected getValidStep(step: number): number {
    return Math.min(Math.max(1, step), this.steps.length) || 1;
  }

  isFirstStep = (): boolean => this.step === 1;
  isLastStep = (): boolean => this.step === this.steps.length;
  firstStep = (): void => {
    this.step = 1;
  };
  nextStep = (): void => {
    this.step++;
  };
  prevStep = (): void => {
    this.step--;
  };
  lastStep = (): void => {
    this.step = this.steps.length;
  };

  render(): JSX.Element {
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
  }

  componentWillUnmount(): void {
    this.unmounting = true;
  }

  prev = (): void => {
    const { isFirst, prev, done } = this.props;
    if (isFirst() && done) {
      done();
    } else {
      prev();
    }
  }

  next = (): void => {
    const next = this.props.next;
    const nextStep = this.props.wizard.nextStep;
    if (nextStep !== next) {
      const result = next();
      if (result instanceof Promise) {
        this.setState({ waiting: true });
        result.then(nextStep).finally(() => {
          if (this.unmounting) {
            return;
          }
          this.setState({ waiting: false });
        });
      } else if (typeof result === "boolean" && result) {
        nextStep();
      }
    } else {
      nextStep();
    }
  }

  submit = (): void => {
    if (!this.form.noValidate) {
      const valid = this.form.checkValidity();
      if (!valid) {
        return;
      }
    }
    this.next();
  }

  renderLoading(): JSX.Element {
    return (
      <div className="step-loading flex center">
        <Spinner/>
      </div>
    );
  }

  render(): JSX.Element {
    const {
      step, isFirst, isLast, children,
      loading, customButtons, disabledNext, scrollable,
      hideNextBtn, hideBackBtn, beforeContent, afterContent, noValidate, skip, moreButtons,
    } = this.props;
    let { className, contentClass, nextLabel, prevLabel, waiting } = this.props;
    if (skip) {
      return;
    }
    waiting = (waiting !== undefined) ? waiting : this.state.waiting;
    className = cssNames(`WizardStep step${step}`, className);
    contentClass = cssNames("step-content", { scrollable }, contentClass);
    prevLabel = prevLabel || (isFirst() ? <Trans>Cancel</Trans> : <Trans>Back</Trans>);
    nextLabel = nextLabel || (isLast() ? <Trans>Submit</Trans> : <Trans>Next</Trans>);
    return (
      <form className={className}
        onSubmit={prevDefault(this.submit)} noValidate={noValidate}
        ref={(e): void => {
          this.form = e;
        }}>
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
