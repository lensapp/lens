/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./stepper.scss";
import React from "react";
import { cssNames } from "@k8slens/utilities";

export interface StepperProps extends React.HTMLProps<HTMLDivElement> {
  step: number;
  steps: Step[];
}

interface Step {
  title?: string;
}

export const Stepper = (props: StepperProps) => {
  const { className, steps, step, ...divProps } = props;
  const stepsCount = steps.length;
  const boundStep = Math.min(Math.max(1, step), stepsCount);

  return (
    <div {...divProps} className={cssNames("Stepper flex auto", className)}>
      {steps.map(({ title }, i) => {
        const stepNumber = i + 1;
        const isLast = i === stepsCount - 1;
        const stepClass = {
          done: stepNumber < boundStep,
          active: stepNumber === boundStep,
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
};
