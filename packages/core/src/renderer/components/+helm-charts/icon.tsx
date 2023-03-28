/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { cssNames } from "@k8slens/utilities";
import React, { useState } from "react";

export interface HelmChartIconProps {
  className?: string;
  imageUrl?: string;
}

export const HelmChartIcon = ({
  imageUrl = "",
  className,
}: HelmChartIconProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const backgroundImage = `url(${imageUrl})`;
  const placeholderImageUrl = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNzIyLjggNzAyIiB3aWR0aD0iNzIyLjAiIGhlaWdodD0iNzAyIiBmaWxsPSJjbHV...9lbiIgY2xhc3M9ImN1cnJlbnRDb2xvcnRlciI+PC9zdmc+Cg=="

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const isValidImage = () => {
    return /^https?:\/\/.*(?<!\.svg)$/.test(imageUrl);
  };

  return (
    <div
      className={cssNames("HelmChartIcon", className)}
      data-testid="image-container"
      style={{
        backgroundImage: isImageLoaded ? backgroundImage : `url(${placeholderImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {isValidImage() && (
        <img
          src={imageUrl}
          alt=""
          onLoad={handleImageLoad}
          style={{ opacity: 0 }}
        />
      )}
    </div>
  );
};
