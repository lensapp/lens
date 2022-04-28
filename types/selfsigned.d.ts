/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

 declare module "selfsigned" {
   export interface SelfSignedCert {
     private: string;
     public: string;
     cert: string;
   }

   export type GenerateAttributes = Array<any>;

   export interface GenerateOptions {
     keySize?: number;
     days?: number;
     algorithm?: "sha1" | "sha256";
     extensions?: any;
     pkcs7?: boolean;
     clientCertificate?: boolean;
     clientCertificateCN?: string;
   }

   export function generate(attrs: GenerateAttributes, opts: GenerateOptions): SelfSignedCert;
 }
