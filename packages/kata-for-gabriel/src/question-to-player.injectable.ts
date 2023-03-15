import { getInjectable } from "@ogre-tools/injectable";

const questionToPlayerInjectable = getInjectable({
  id: "question-to-player",
  instantiate: () => (question: string) => Promise.resolve(true),
  causesSideEffects: true,
});

export default questionToPlayerInjectable;
