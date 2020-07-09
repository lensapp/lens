export interface KubeWatchEvent<T = any> {
  type: "ADDED" | "MODIFIED" | "DELETED";
  object?: T;
}

export interface KubeWatchRouteEvent {
  type: "STREAM_END";
  url: string;
  status: number;
}

export interface KubeWatchRouteQuery {
  api: string | string[];
}
