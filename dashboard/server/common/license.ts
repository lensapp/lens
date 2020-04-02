export interface ILicense {
  name?: string;
  maxNodes?: number;
  owner?: {
    company?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  validUntil?: string;
  recurring?: boolean;
}
