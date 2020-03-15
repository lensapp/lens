export interface IKubeWatchEvent<T = any> {
  type: "ADDED" | "MODIFIED" | "DELETED";
  object?: T;
}

export interface IKubeWatchRouteEvent {
  type: "STREAM_END";
  url: string;
  status: number;
}

export interface IKubeWatchRouteQuery {
  api: string | string[];
}
