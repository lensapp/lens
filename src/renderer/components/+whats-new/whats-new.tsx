import "./whats-new.scss";
import fs from "fs";
import path from "path";
import React from "react";
import { observer } from "mobx-react";
import { userStore } from "../../../common/user-store";
import { navigate } from "../../navigation";
import { Button } from "../button";
import marked from "marked";
import { SvgIcon } from "@material-ui/core";
import { LensLogo } from "../../svgs";

@observer
export class WhatsNew extends React.Component {
  releaseNotes = fs.readFileSync(path.join(__static, "RELEASE_NOTES.md")).toString();

  ok = () => {
    navigate("/");
    userStore.saveLastSeenAppVersion();
  };

  render() {
    const releaseNotes = marked(this.releaseNotes);

    return (
      <div className="WhatsNew flex column">
        <div className="content box grow">
          <SvgIcon component={LensLogo}/>
          <div
            className="release-notes flex column gaps"
            dangerouslySetInnerHTML={{ __html: releaseNotes }}
          />
        </div>
        <div className="bottom">
          <Button
            primary autoFocus
            label="Ok, got it!"
            onClick={this.ok}
          />
        </div>
      </div>
    );
  }
}
