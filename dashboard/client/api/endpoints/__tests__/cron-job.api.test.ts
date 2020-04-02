import { CronJob } from "../";

//jest.mock('../../../components/+login/auth.store.ts', () => 'authStore');
jest.mock('../../kube-watch-api.ts', () => 'kube-watch-api');

const cronJob = new CronJob({
  metadata: {
    name: "hello",
    namespace: "default",
    selfLink: "/apis/batch/v1beta1/namespaces/default/cronjobs/hello",
    uid: "cd3af13f-0b70-11ea-93da-9600002795a0",
    resourceVersion: "51394448",
    creationTimestamp: "2019-11-20T08:36:09Z",
  },
  spec: {
    schedule: "30 06 31 12 *",
    concurrencyPolicy: "Allow",
    suspend: false,
  },
  status: {}
} as any)

describe("Check for CronJob schedule never run", () => {
  test("Should be false with normal schedule", () => {
    expect(cronJob.isNeverRun()).toBeFalsy();
  });

  test("Should be false with other normal schedule", () => {
    cronJob.spec.schedule = "0 1 * * *";
    expect(cronJob.isNeverRun()).toBeFalsy();
  });

  test("Should be true with date 31 of February", () => {
    cronJob.spec.schedule = "30 06 31 2 *"
    expect(cronJob.isNeverRun()).toBeTruthy();
  });

  test("Should be true with date 32 of July", () => {
    cronJob.spec.schedule = "0 30 06 32 7 *"
    expect(cronJob.isNeverRun()).toBeTruthy();
  });

  test("Should be false with predefined schedule", () => {
    cronJob.spec.schedule = "@hourly";
    expect(cronJob.isNeverRun()).toBeFalsy();
  });
});
