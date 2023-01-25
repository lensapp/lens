/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface ParentOfChildComposite<Id extends string = string> {
  id: Id;
}

export interface ChildOfParentComposite<ParentId extends string = string> {
  parentId: ParentId;
}

export type RootComposite<Id extends string = string> =
  & { parentId: undefined }
  & ParentOfChildComposite<Id>;
