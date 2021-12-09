export interface InstallRequest {
  fileName: string;
  dataP: Promise<Buffer | null>;
}
