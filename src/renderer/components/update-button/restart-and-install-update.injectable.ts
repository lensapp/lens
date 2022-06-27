import { getInjectable } from "@ogre-tools/injectable";
import restartAndInstallUpdateChannel from "../../../common/application-update/update-warning-level/restart-and-install-update-channel.injectable";
import messageToChannelInjectable from "../../utils/channel/message-to-channel.injectable";

const restartAndInstallUpdateInjectable = getInjectable({
  id: "restart-and-install-update",

  instantiate: (di) => {
    const messageToChannel = di.inject(messageToChannelInjectable);
    const channel = di.inject(restartAndInstallUpdateChannel);

    return () => {
      messageToChannel(channel);
    };
  },
});

export default restartAndInstallUpdateInjectable;