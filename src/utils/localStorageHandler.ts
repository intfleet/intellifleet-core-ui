import { jwtDecode } from "jwt-decode";
import EncrypDecrypService from "../utils/encrypDecrypService";

/** ===== Types ===== */

type AppInfo = {
  entity: unknown;
  entityId: number;
  permission: unknown;
  token: string;
};

type JwtPayload = {
  roles?: string[];
  user?: unknown;
  [key: string]: unknown;
};

/** ===== Constants ===== */

const DEFAULT_APP_INFO: AppInfo = {
  entity: null,
  entityId: 0,
  permission: null,
  token: ""
};

const INDEX_PREFIX = "_index__";
const SPLIT_INDEX = 7;
const SECRET_KEY_LENGTH = 32;
const INDEX_MIN_LENGTH = INDEX_PREFIX.length + 1 + EncrypDecrypService.BROWSER_ID_LENGTH;
const INDEX_MAX_LENGTH = INDEX_MIN_LENGTH + SECRET_KEY_LENGTH;

/** ===== Utils ===== */

const isValidParam = (arg: unknown): boolean => {
  return !(
    arg === null ||
    arg === undefined ||
    arg === "null" ||
    arg === "undefined" ||
    arg === ""
  );
};

/** ===== StorageHandler ===== */

const StorageHandler = {
  createIndex: (): string => EncrypDecrypService.createIndex(INDEX_PREFIX),

  removeIndex: (): void => {
    const index = StorageHandler.getIndex();
    if (index) localStorage.removeItem(index);
  },

  getIndex: (): string | undefined => {
    return Object.keys(localStorage).find((f) =>
      f.includes(INDEX_PREFIX)
    );
  },

  updateIndexBySecretKey: (secretKey: string): string | undefined => {
    let index: string | undefined;
    let oldIndex = StorageHandler.getIndex();
    const storageInfo = oldIndex
      ? localStorage.getItem(oldIndex)
      : null;

    if (oldIndex && INDEX_MAX_LENGTH === oldIndex.length) {
      localStorage.removeItem(oldIndex);
      oldIndex =
        oldIndex.substring(
          0,
          oldIndex.length - SPLIT_INDEX - SECRET_KEY_LENGTH
        ) +
        oldIndex.substring(oldIndex.length - SPLIT_INDEX);
    }

    if (
      oldIndex &&
      INDEX_MIN_LENGTH === oldIndex.length &&
      isValidParam(secretKey)
    ) {
      index =
        oldIndex.substring(0, oldIndex.length - SPLIT_INDEX) +
        secretKey +
        oldIndex.substring(oldIndex.length - SPLIT_INDEX);

      localStorage.removeItem(oldIndex);
    }

    if (index && storageInfo) {
      localStorage.setItem(index, storageInfo);
    }

    return index;
  },

  getSecretKey: (): string | undefined => {
    let secretKey: string | undefined;
    let index = StorageHandler.getIndex();

    if (index && INDEX_MAX_LENGTH === index.length) {
      // ✅ FIXED HERE
      secretKey = index.substring(
        index.length - SPLIT_INDEX - SECRET_KEY_LENGTH,
        index.length - SPLIT_INDEX
      );
    } else if (index && INDEX_MIN_LENGTH === index.length) {
      secretKey = EncrypDecrypService.generateSecretKey();
      StorageHandler.updateIndexBySecretKey(secretKey);
    }

    return secretKey;
  },

  getStorageInfo: (): AppInfo => {
    const secretKey = StorageHandler.getSecretKey();
    const index = StorageHandler.getIndex();

    if (!index || !secretKey) return { ...DEFAULT_APP_INFO };

    const strEncStorageInfo = localStorage.getItem(index);

    if (isValidParam(strEncStorageInfo)) {
      const strStorageInfo = EncrypDecrypService.decrypt(
        strEncStorageInfo as string,
        secretKey
      );

      if (strStorageInfo) {
        return JSON.parse(strStorageInfo) as AppInfo;
      }
    }

    return { ...DEFAULT_APP_INFO };
  },

  setStorageInfo: (storageInfo: Partial<AppInfo>): void => {
    const index = StorageHandler.getIndex();
    const secretKey = StorageHandler.getSecretKey();

    if (index && secretKey && storageInfo) {
      const strStorageInfo = EncrypDecrypService.encrypt(
        JSON.stringify({ ...DEFAULT_APP_INFO, ...storageInfo }),
        secretKey
      );
      localStorage.setItem(index, strStorageInfo);
    }
  },

  resetStorageInfo: (): void => {
    const index = StorageHandler.getIndex();
    const secretKey = StorageHandler.getSecretKey();

    if (index && secretKey) {
      const strStorageInfo = EncrypDecrypService.encrypt(
        JSON.stringify({ ...DEFAULT_APP_INFO }),
        secretKey
      );
      localStorage.setItem(index, strStorageInfo);
    }
  }
};

/** ===== LocalStorageHandler ===== */

const LocalStorageHandler = {
  createIndex: (): void => {
    const index = StorageHandler.getIndex();
    if (!isValidParam(index)) {
      StorageHandler.createIndex();
    }
  },

  removeIndex: (): void => StorageHandler.removeIndex(),

  resetStorage: (): void => StorageHandler.resetStorageInfo(),

  setToken: (token: string): void => {
    const storageInfo = StorageHandler.getStorageInfo();
    storageInfo.token = token;
    StorageHandler.setStorageInfo(storageInfo);
  },

  getToken: (): string => {
    return StorageHandler.getStorageInfo().token;
  },

  setPermission: (permission: unknown): void => {
    const storageInfo = StorageHandler.getStorageInfo();
    storageInfo.permission = permission;
    StorageHandler.setStorageInfo(storageInfo);
  },

  getPermission: (): unknown => {
    return StorageHandler.getStorageInfo().permission;
  },

  setEntityId: (entityId: number): void => {
    const storageInfo = StorageHandler.getStorageInfo();
    storageInfo.entityId = entityId;
    StorageHandler.setStorageInfo(storageInfo);
  },

  getEntityId: (): number => {
    return StorageHandler.getStorageInfo().entityId;
  },

  setEntity: (entity: unknown): void => {
    const storageInfo = StorageHandler.getStorageInfo();
    storageInfo.entity = entity;
    StorageHandler.setStorageInfo(storageInfo);
  },

  getEntity: (): unknown => {
    return StorageHandler.getStorageInfo().entity;
  },

  getUserRole: (): string => {
    const token = StorageHandler.getStorageInfo().token;
    if (!token) return "";

    const payload = jwtDecode<JwtPayload>(token);
    return payload.roles?.[0] ?? "";
  },

  getLoggedInUser: (): unknown => {
    const token = StorageHandler.getStorageInfo().token;
    if (!token) return null;

    const payload = jwtDecode<JwtPayload>(token);
    return payload.user ?? null;
  }
};

export default LocalStorageHandler;