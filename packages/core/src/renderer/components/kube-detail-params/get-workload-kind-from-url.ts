/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export function getWorkloadKindFromUrl(url: string) {
  return getLastSegment(url);
}

function getLastSegment(url: string) {
  const regex = /\/([^/]*)\/[^/]*$/;
  const result = regex.exec(url);
  
  return result ? result[1] : null;
}
