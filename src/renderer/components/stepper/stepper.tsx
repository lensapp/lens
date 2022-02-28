/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./stepper.scss";
import React from "react";
import { cssNames } from "../../utils";

export interface StepperProps extends React.HTMLProps<any> {
  step: number;
  steps: Step[];
}

export interface Step {
  title?: string;
}

export class Stepper extends React.Component<StepperProps, {}> {
  render() {
    const { className, steps, step: rawStep, ...props } = this.props;
    const stepsCount = steps.length;
    const step = Math.min(Math.max(1, rawStep), stepsCount);

    return (
      <div {...props} className={cssNames("Stepper flex auto", className)}>
        {steps.map(({ title }, i) => {
          const stepNumber = i + 1;
          const isLast = i === stepsCount - 1;
          const stepClass = {
            done: stepNumber < step,
            active: stepNumber === step,
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
