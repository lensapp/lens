import "./button.scss";
import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface ButtonProps extends ButtonHTMLAttributes<any>, TooltipDecoratorProps {
  label?: React.ReactNode;
  waiting?: boolean;
  primary?: boolean;
  accent?: boolean;
  plain?: boolean;
  hidden?: boolean;
  active?: boolean;
  big?: boolean;
  round?: boolean;
  href?: string; // render as hyperlink
  target?: "_blank"; // in case of using @href
}

@withTooltip
export class Button extends React.PureComponent<ButtonProps, {}> {
  private link: HTMLAnchorElement;
  private button: HTMLButtonElement;

  render() {
    const { className, waiting, label, primary, accent, plain, hidden, active, big, round, tooltip, children, ...props } = this.props;
    const btnProps = props as Partial<ButtonProps>;
    if (hidden) return null;

    btnProps.className = cssNames('Button', className, {
      waiting, primary, accent, plain, active, big, round,
    });

    const btnContent: ReactNode = (
      <>
        {label}
        {children}
      </>
    );

    // render as link
    if (this.props.href) {
      return (
        <a {...btnProps} ref={e => this.link = e}>
          {btnContent}
        </a>
      )
    }

    // render as button
    return (
      <button type="button" {...btnProps} ref={e => this.button = e}>
        {btnContent}
      </button>
    )
  }
}
