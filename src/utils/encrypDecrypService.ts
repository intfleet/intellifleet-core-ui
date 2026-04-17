//Library used from cdn Link: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
//reference https://www.tutorialspoint.com/What-is-JavaScript-AES-Encryption

// import CryptoJS from "custom-crypto-js";
//import { encryptText, decryptText } from './custom-crypto-js/cryptoNative.jsx';

// Reference: https://www.npmjs.com/package/node-forge
import forge from "node-forge";

/** ===== Constants ===== */
export const BROWSER_ID_LENGTH = 64;

/** ===== Types ===== */
type AppInfo = Record<string, unknown>;

/** ===== Encryption ===== */
const encrypt = (text: string, secretKey: string): string => {
  try {
    const salt = forge.random.getBytesSync(16);

    // 🔐 Increased iterations + key length (better security)
    const key = forge.pkcs5.pbkdf2(secretKey, salt, 100000, 32);

    const iv = forge.random.getBytesSync(16);

    const cipher = forge.cipher.createCipher("AES-CBC", key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(text, "utf8"));
    cipher.finish();

    const encrypted = cipher.output.getBytes();

    // Combine salt + iv + encrypted
    return forge.util.encode64(salt + iv + encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return "";
  }
};

/** ===== Decryption ===== */
const decrypt = (encryptedBase64: string, secretKey: string): string => {
  try {
    if(!isEncrypted(encryptedBase64)) return encryptedBase64;

    const combined = forge.util.decode64(encryptedBase64);

    // ✅ Use buffer instead of raw string slicing
    const buffer = forge.util.createBuffer(combined, "binary");

    const salt = buffer.getBytes(16);
    const iv = buffer.getBytes(16);
    const encrypted = buffer.getBytes();

    const key = forge.pkcs5.pbkdf2(secretKey, salt, 100000, 32);

    const decipher = forge.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv });

    decipher.update(forge.util.createBuffer(encrypted, "binary"));

    const result = decipher.finish();
    if (!result) throw new Error("Decryption failed");

    return decipher.output.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
};

/** ===== Secret Key Generator ===== */
const generateSecretKey = (length: number = 32): string => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let secretKey = "";

  while (secretKey.length < length) {
    const byte = forge.random.getBytesSync(1);
    const index = byte.charCodeAt(0) % charset.length;
    secretKey += charset[index];
  }

  return secretKey;
};

/** ===== Browser Fingerprint ===== */
const generateBrowserId = (): string => {
  try {
    const userAgent = navigator.userAgent || "";
    const platform = navigator.platform || "";

    const plugins = Array.from(navigator.plugins || [])
      .map((p) => p.name)
      .join(",");

    const fingerprint = userAgent + platform + plugins;

    const md = forge.md.sha256.create();
    md.update(fingerprint, "utf8");

    return md.digest().toHex(); // 64 chars
  } catch (error) {
    console.error("Browser ID generation failed:", error);
    return "";
  }
};

/** ===== Create Index ===== */
const createIndex = (prefix: string, appInfo: AppInfo = {}): string => {
  const browserId = generateBrowserId();
  const index = `${prefix}_${browserId}`;

  const exists = Object.keys(localStorage).some((key) =>
    key.startsWith(index)
  );

  if (!exists) {
    localStorage.setItem(index, JSON.stringify(appInfo));
  }

  return index;
};

const isEncrypted = (value: string): boolean => {
  try {
    const decoded = forge.util.decode64(value);
    return decoded.length > 32; // salt(16) + iv(16) minimum
  } catch {
    return false;
  }
};

/** ===== Export ===== */
const CryptoService = {
  encrypt,
  decrypt,
  generateSecretKey,
  generateBrowserId,
  createIndex,
  BROWSER_ID_LENGTH
};

export default CryptoService;