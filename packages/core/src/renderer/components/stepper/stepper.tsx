/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./stepper.scss";
import React from "react";
import { cssNames } from "@k8slens/utilities";

export interface StepperProps extends React.HTMLProps<any> {
  step: number;
  steps: Step[];
}

interface Step {
  title?: string;
}

export class Stepper extends React.Component<StepperProps, {}> {
  render() {
    const { className, steps, ...props } = this.props;
    const stepsCount = steps.length;
    let { step } = this.props;

    step = Math.min(Math.max(1, step), stepsCount);

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
