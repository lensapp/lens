import { getDi } from "./src/get-di";
import lensLinkInjectable from "./src/lens-link.injectable";

const di = getDi();

const lensLink = di.inject(lensLinkInjectable);

lensLink();
