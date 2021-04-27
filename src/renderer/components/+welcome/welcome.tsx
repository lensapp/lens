import "./welcome.scss";
import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { productName, slackUrl } from "../../../common/vars";
import { welcomeMenuRegistry } from "../../../extensions/registries";
import { navigate } from "../../navigation";
import { catalogURL } from "../+catalog";
import { preferencesURL } from "../+preferences";

@observer
export class Welcome extends React.Component {

  componentDidMount() {
    if (welcomeMenuRegistry.getItems().find((item) => item.title === "Browse Your Catalog")) {
      return;
    }

    welcomeMenuRegistry.add({
      title: "Browse Your Catalog",
      icon: "view_list",
      click: () => navigate(catalogURL())
    });

    if (welcomeMenuRegistry.getItems().length === 1) {
      welcomeMenuRegistry.add({
        title: "Configure Preferences",
        icon: "settings",
        click: () => navigate(preferencesURL())
      });
    }
  }

  render() {
    return (
      <div className="Welcome flex justify-center align-center">
        <div className="box">
          <Icon svg="logo-lens" className="logo" />

          <h2>Welcome to {productName} 5 Beta!</h2>

          <p>
            Here are some steps to help you get started with {productName} 5 Beta.
            If you have any questions or feedback, please join our <a href={slackUrl} target="_blank" rel="noreferrer">Lens Community slack channel</a>.
          </p>

          <ul className="box">
            { welcomeMenuRegistry.getItems().map((item, index) => (
              <li key={index} className="flex grid-12" onClick={() => item.click()}>
                <Icon material={item.icon} className="box col-1" /> <a className="box col-10">{item.title}</a> <Icon material="navigate_next" className="box col-1" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
