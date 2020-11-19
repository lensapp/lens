export type KubeObjectStatus = {
  level: KubeObjectStatusLevel;
  text: string;
  timestamp?: string;
};

export enum KubeObjectStatusLevel {
  INFO = 1,
  WARNING = 2,
  CRITICAL = 3
}