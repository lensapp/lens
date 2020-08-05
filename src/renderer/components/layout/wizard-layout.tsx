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
}

@observer
export class WizardLayout extends React.Component<Props> {
  render() {
    const { className, contentClass, infoPanelClass, infoPanel, header, headerClass, children: content } = this.props;
    return (
      <div className={cssNames("WizardLayout", className)}>
        {header && (
          <div className={cssNames("head-col flex gaps align-center", headerClass)}>
            {header}
          </div>
        )}
        <div className={cssNames("content-col flex column gaps", contentClass)}>
          {content}
        </div>
        <div className={cssNames("info-col flex column gaps", infoPanelClass)}>
          {infoPanel}
        </div>
      </div>
    )
  }
}
