import { Tracker } from "../common/tracker"
import { app, remote } from "electron"

export const tracker = new Tracker(app || remote.app);
