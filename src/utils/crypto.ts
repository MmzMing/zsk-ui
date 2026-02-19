/**
 * 加密相关工具函数
 * @module utils/crypto
 */

import JSEncrypt from "jsencrypt";
import { logger } from "./logger";

export const encryptWithRSA = (
  data: string,
  publicKey: string
): string | null => {
  try {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(data);
    return encrypted || null;
  } catch {
    logger.error("RSA加密失败");
    return null;
  }
};

export const decryptWithRSA = (
  encryptedData: string,
  privateKey: string
): string | null => {
  try {
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    const decrypted = decrypt.decrypt(encryptedData);
    return decrypted || null;
  } catch {
    logger.error("RSA解密失败");
    return null;
  }
};

export const base64Encode = (str: string): string => {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch {
    logger.error("Base64编码失败");
    return "";
  }
};

export const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch {
    logger.error("Base64解码失败");
    return "";
  }
};

export const md5Hash = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default {
  encryptWithRSA,
  decryptWithRSA,
  base64Encode,
  base64Decode,
  md5Hash,
};
