import "./wizard-layout.scss"
import React from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";

interface Props {
  className?: IClassName;
  header?: React.ReactNode;
  headerClass?: IClassName;
  contentClass?: IClassName;
  infoPanelClass?: IClassName;
  infoPanel?: React.ReactNode;
  centered?: boolean;  // Centering content horizontally
}

@observer
export class WizardLayout extends React.Component<Props> {
  render() {
    const { className, contentClass, infoPanelClass, infoPanel, header, headerClass, centered, children: content } = this.props;
    return (
      <div className={cssNames("WizardLayout", { centered }, className)}>
        {header && (
          <div className={cssNames("head-col flex gaps align-center", headerClass)}>
            {header}
          </div>
        )}
        <div className={cssNames("content-col flex column gaps", contentClass)}>
          <div className="flex column gaps">
            {content}
          </div>
        </div>
        {infoPanel && (
          <div className={cssNames("info-col flex column gaps", infoPanelClass)}>
            {infoPanel}
          </div>
        )}
      </div>
    )
  }
}
