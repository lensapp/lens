// Cluster store migrations

import version200Beta2 from "./2.0.0-beta.2"
import version241 from "./2.4.1"
import version260Beta2 from "./2.6.0-beta.2"
import version260Beta3 from "./2.6.0-beta.3"
import version270Beta0 from "./2.7.0-beta.0"
import version270Beta1 from "./2.7.0-beta.1"
import version360Beta1 from "./3.6.0-beta.1"
import snap from "./snap"

export default {
  ...version200Beta2,
  ...version241,
  ...version260Beta2,
  ...version260Beta3,
  ...version270Beta0,
  ...version270Beta1,
  ...version360Beta1,
  ...snap
}