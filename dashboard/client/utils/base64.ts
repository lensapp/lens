// Encode/decode utf-8 base64 string
import * as Base64 from "crypto-js/enc-base64";
import * as Utf8 from "crypto-js/enc-utf8";

export const base64 = {
  decode(data: string) {
    return Base64.parse(data).toString(Utf8);
  },
  encode(data: string) {
    return Utf8.parse(data).toString(Base64);
  }
};
