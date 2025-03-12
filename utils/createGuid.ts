import { v4 as uuidv4 } from "uuid";

const BASE64_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";

/**
 * Converts a UUID to an IFC-compliant GUID
 */
export function createGuid(): string {
  const bytes = Array.from(Buffer.from(uuidv4().replace(/-/g, ""), "hex"));
  let result = "";
  let num = 0;
  let cnt = 0;

  for (let i = 0; i < 16; i++) {
    num = (num << 8) + bytes[i];
    cnt += 8;

    while (cnt >= 6) {
      cnt -= 6;
      result += BASE64_CHARS[(num >> cnt) & 63];
    }
  }

  if (cnt > 0) {
    result += BASE64_CHARS[(num & ((1 << cnt) - 1)) << (6 - cnt)];
  }

  // Ensure first character is "0", "1", "2", or "3"
  if (!["0", "1", "2", "3"].includes(result[0])) {
    result = "0" + result.substring(1);
  }

  return result;
}
