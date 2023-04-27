/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonValue } from "type-fest";
import type { ExternalDocumentation } from "./external-documentation";

/**
 * (?i)^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$
 */
export type UUIDRegexString = string;

/**
 * (?i)^[0-9a-f]{8}-?[0-9a-f]{4}-?3[0-9a-f]{3}-?[0-9a-f]{4}-?[0-9a-f]{12}$
 */
export type UUID3RegexString = string;

/**
 * (?i)^[0-9a-f]{8}-?[0-9a-f]{4}-?4[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$
 */
export type UUID4RegexString = string;

/**
 * (?i)^[0-9a-f]{8}-?[0-9a-f]{4}-?5[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$
 */
export type UUID5RegexString = string;

/* eslint-disable max-len */
/**
 * ^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\d{3})\\d{11})$
 */
export type CreditCardRegexString = string;
/* eslint-enable max-len */

export interface JSONSchemaProps {
  $ref?: string;
  $schema?: string;
  additionalItems?: JSONSchemaProps | boolean;
  additionalProperties?: JSONSchemaProps | boolean;
  allOf?: JSONSchemaProps[];
  anyOf?: JSONSchemaProps[];

  /**
   * default is a default value for undefined object fields.
   * Defaulting is a beta feature under the CustomResourceDefaulting feature gate.
   * Defaulting requires spec.preserveUnknownFields to be false.
   */
  _default?: object;

  definitions?: Partial<Record<string, JSONSchemaProps>>;
  dependencies?: Partial<Record<string, object>>;
  description?: string;
  _enum?: object[];
  example?: JsonValue;

  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  externalDocs?: ExternalDocumentation;

  /**
   * format is an OpenAPI v3 format string.
   * Unknown formats are ignored.
   *
   * The following formats are validated:
   * - bsonobjectid: a bson object ID, i.e. a 24 characters hex string
   * - uri: an URI as parsed by Golang net/url.ParseRequestURI
   * - email: an email address as parsed by Golang net/mail.ParseAddress
   * - hostname: a valid representation for an Internet host name, as defined by RFC 1034, section 3.1 [RFC1034].
   * - ipv4: an IPv4 IP as parsed by Golang net.ParseIP
   * - ipv6: an IPv6 IP as parsed by Golang net.ParseIP
   * - cidr: a CIDR as parsed by Golang net.ParseCIDR
   * - mac: a MAC address as parsed by Golang net.ParseMAC
   * - uuid: an UUID that allows uppercase defined by the regex {@link UUIDRegexString}
   * - uuid3: an UUID3 that allows uppercase defined by the regex {@link UUID3RegexString}
   * - uuid4: an UUID4 that allows uppercase defined by the regex {@link UUID4RegexString}
   * - uuid5: an UUID5 that allows uppercase defined by the regex {@link UUID5RegexString}
   * - isbn: an ISBN10 or ISBN13 number string like "0321751043" or "978-0321751041"
   * - isbn10: an ISBN10 number string like "0321751043"
   * - isbn13: an ISBN13 number string like "978-0321751041"
   * - creditcard: a credit card number defined by the regex {@link CreditCardRegexString}
   * - ssn: a U.S. social security number following the regex ^\\d{3}[- ]?\\d{2}[- ]?\\d{4}$
   * - hexcolor: an hexadecimal color code like "#FFFFFF: following the regex ^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$
   * - rgbcolor: an RGB color code like rgb like "rgb(255,255,2559"
   * - byte: base64 encoded binary data
   * - password: any kind of string
   * - date: a date string like "2006-01-02" as defined by full-date in RFC3339
   * - duration: a duration string like "22 ns" as parsed by Golang time.ParseDuration or with Scala's duration format
   * - datetime: a date time string like "2014-12-15T19:30:20.000Z" as defined by date-time in RFC3339.
   */
  format?: string;

  id?: string;
  items?: JSONSchemaProps | JSONSchemaProps[];
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  minimum?: number;
  multipleOf?: number;
  not?: JSONSchemaProps;
  nullable?: boolean;
  oneOf?: JSONSchemaProps[];
  pattern?: string;
  patternProperties?: Partial<Record<string, JSONSchemaProps>>;
  properties?: Partial<Record<string, JSONSchemaProps>>;
  required?: Array<string>;
  title?: string;
  type?: string;
  uniqueItems?: boolean;
  x_kubernetes_embedded_resource?: boolean;
  x_kubernetes_int_or_string?: boolean;
  x_kubernetes_list_map_keys?: string[];
  x_kubernetes_list_type?: string;
  x_kubernetes_map_type?: string;
  x_kubernetes_preserve_unknown_fields?: boolean;
}
