import "./button-panel.scss";
import React from "react";

export function ButtonPannel(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <>
      <br />
      <div className="ButtonPannel flex row align-right box grow">
        {props.children}
      </div>
    </>
  );
}
