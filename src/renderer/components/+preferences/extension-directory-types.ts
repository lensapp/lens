/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface Review {
  id: string;
  parent?: string;
  rating: number;
  text?: string
  title?: string
  type: string;
  user: string
}

export interface User {
  /** @format uuid */
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  password?: string;
  phone?: string;
  type?: "publisher" | "user";

  /**
   * User Status
   * @format int32
   */
  userStatus?: number;
}

export interface Tag {
  /** @format int64 */
  id?: number;
  name?: string;
}

export interface Category {
  /** @format int64 */
  id?: number;
  name?: string;
}

export interface Extension {
  /** @format uuid */
  id?: string;
  publisher?: User;
  version?: string;
  license?: string;
  category?: Category[];
  categories?: Category[];
  installationName?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  previewImageUrl?: string;
  appIconUrl?: string;

  rating?: number;

  /** @format int64 */
  totalNumberOfInstallations?: number;
  githubRepositoryUrl?: string;
  websiteUrl?: string;
  npmPackageUrl?: string;
  binaryUrl?: string;

  /** @format date-time */
  createdAt?: string;

  /** @format date-time */
  updatedAt?: string;
  tags?: Tag[];

  reviews?: Review[]
}
