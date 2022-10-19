/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

interface PreferencePageComponentProps {
  children: React.ReactElement;
  id: string;
  title: string;
}

export const PreferencePageComponent = ({ children, id, title }: PreferencePageComponentProps ) => (
  <section id={id} data-preference-page-test={id}>
    <h2 data-preference-page-title-test={true}>{title}</h2>

    {children}
  </section>
);
