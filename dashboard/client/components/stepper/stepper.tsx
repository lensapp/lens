import "./stepper.scss";
import * as React from "react";
import { cssNames } from "../../utils";

interface Props extends React.HTMLProps<any> {
  step: number;
  steps: Step[];
}

interface Step {
  title?: string;
}

export class Stepper extends React.Component<Props, {}> {
  render() {
    const { className, steps, ...props } = this.props;
    const stepsCount = steps.length;
    let { step } = this.props;
    step = Math.min(Math.max(1, step), stepsCount);
    return (
      <div {...props} className={cssNames('Stepper flex auto', className)}>
        {steps.map(({ title }, i) => {
          const stepNumber = i + 1;
          const isLast = i === stepsCount - 1;
          const stepClass = {
            done: stepNumber < step,
            active: stepNumber === step
          };
          return (
            <div key={i} className={cssNames("box step", stepClass)}>
              {!isLast ? <span className="line"/> : null}
              <div className="point">{stepNumber}</div>
              <span className="step-title">{title}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
