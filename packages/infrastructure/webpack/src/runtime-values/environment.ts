export type Environment = {
  mode: "production" | "development";
  devtool: false | string;
};

const environment: Environment =
  // Usage of indexers is deliberate to make webpack use runtime env-variables
  // instead of compile-time ones.
  process["env"]["NODE_ENV"] === "development"
    ? {
        mode: "development",
        devtool: "eval-cheap-source-map",
      }
    : {
        mode: "production",
        devtool: false,
      };

export { environment };
