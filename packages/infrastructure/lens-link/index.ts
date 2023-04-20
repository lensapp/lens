import { lensLinkFor } from "./src/lens-link";
import path from "path";

const lensIde = path.join("/Users/jsavolainen/Documents/work/test-lens-link", "lens-ide");

const mikkoFeature = path.join("/Users/jsavolainen/Documents/work/test-lens-link", "mikko-feature");

const lensLink = lensLinkFor();

lensLink({
  targetDirectory: mikkoFeature,
  toDirectory: lensIde,
});
