/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type SubjectKind = "Group" | "ServiceAccount" | "User";

export interface Subject {
  apiGroup?: string;
  kind: SubjectKind;
  name: string;
  namespace?: string;
}
