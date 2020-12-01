import "./wizard-layout.scss";
import React from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";

export interface WizardLayoutProps extends React.DOMAttributes<any> {
  className?: IClassName;
  header?: React.ReactNode;
  headerClass?: IClassName;
  contentClass?: IClassName;
  infoPanelClass?: IClassName;
  infoPanel?: React.ReactNode;
  centered?: boolean;  // Centering content horizontally
}

@observer
export class WizardLayout extends React.Component<WizardLayoutProps> {
  render() {
    const {
      className, contentClass, infoPanelClass, infoPanel, header, headerClass, centered,
      children, ...props
    } = this.props;

    return (
      <div {...props} className={cssNames("WizardLayout", { centered }, className)}>
        {header && (
          <div className={cssNames("head-col flex gaps align-center", headerClass)}>
            {header}
          </div>
        )}
        <div className={cssNames("content-col flex column gaps", contentClass)}>
          <div className="flex column gaps">
            {children}
          </div>
        </div>
        {infoPanel && (
          <div className={cssNames("info-col flex column gaps", infoPanelClass)}>
            {infoPanel}
          </div>
        )}
      </div>
    );
  }
}
