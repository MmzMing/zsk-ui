// ===== 1. 依赖导入区域 =====

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====
/**
 * Base64 URL 解码为 ArrayBuffer
 *
 * @param base64 Base64 编码的字符串（支持 URL 安全格式）
 * @returns 解码后的 ArrayBuffer 对象
 */
function base64UrlToArrayBuffer(base64: string): ArrayBuffer {
  const base64Url = base64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64Url.length % 4;
  const paddedBase64 = pad ? base64Url + "=".repeat(4 - pad) : base64Url;
  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * ArrayBuffer 转 Base64
 *
 * @param buffer 待转换的 ArrayBuffer 对象
 * @returns Base64 编码的字符串
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 将 Base64 格式的公钥转换为 CryptoKey 对象
 *
 * @param pemPublicKey Base64 编码的公钥字符串（SPKI 格式）
 * @returns CryptoKey 对象，用于加密操作
 */
async function importPublicKey(pemPublicKey: string): Promise<CryptoKey> {
  const binaryKey = base64UrlToArrayBuffer(pemPublicKey);

  return await window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
/**
 * 使用 RSA 公钥加密数据
 *
 * 该函数使用 Web Crypto API 实现 RSA-OAEP 加密算法，
 * 适用于前端对敏感数据（如密码）进行加密后传输。
 *
 * @param data 待加密的原始数据（如用户密码）
 * @param publicKeyBase64 Base64 编码的 RSA 公钥（从后端获取）
 * @returns Base64 编码的加密数据，可直接传输给后端
 * @throws 当加密失败时抛出异常
 *
 * @example
 * const publicKey = await getPublicKey();
 * const encryptedPassword = await rsaEncrypt(password, publicKey.publicKey);
 */
export async function rsaEncrypt(data: string, publicKeyBase64: string): Promise<string> {
  const publicKey = await importPublicKey(publicKeyBase64);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    dataBuffer
  );

  return arrayBufferToBase64(encryptedBuffer);
}
