import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from "axios";

import APIConstants from "@/utils/constants/APIConstants";
import { HttpReqHandlerError } from "@/errors/customError";
import LocalStorageHandler from "@/utils/localStorageHandler";
import HttpStatus from "@/utils/constants/httpStatus";
import { ENV } from '@/config/env';

/** ===== Types ===== */
type ApiResponse<T = unknown> = {
  statusCode?: number;
  data?: T;
  message?: string;
};

/** ===== Class ===== */
class HttpRequestHandler {
  private axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json"
      }
    });

    /** ===== Request Interceptor ===== */
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = LocalStorageHandler.getToken();

        if (config.headers) {
          config.headers.Authorization = token ? `Bearer ${token}` : "";
          config.headers["is-entity-list-required"] = token ? false : true;

          const entityId = LocalStorageHandler.getEntityId();
          config.headers["entity-id"] = entityId ?? "";
        }

        return config;
      }
    );

    /** ===== Status Validator ===== */
    this.axios.defaults.validateStatus = (status: number) =>
      status >= HttpStatus.OK &&
      status < HttpStatus.MULTIPLE_CHOICES;
  }

  /** ===== Default Props ===== */
  setDefaultProps = (): void => {
    this.axios.defaults.headers.post["Content-Type"] =
      "application/json";
  };

  /** ===== CRUD Methods ===== */

  postData = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<T> => {
    try {
      const res = await this.axios.post(url, data);
      return this.processApiResponse<T>(res);
    } catch (error: unknown) {
      return this.processApiResponse<T>(error);
    }
  };

  getData = async <T = unknown>(
    url: string,
    data: unknown = {}
  ): Promise<T> => {
    try {
      const params = new URLSearchParams({
        params: JSON.stringify(data)
      });

      const res = await this.axios.get(url, { params });
      return this.processApiResponse<T>(res);
    } catch (error: unknown) {
      return this.processApiResponse<T>(error);
    }
  };

  deleteData = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<T> => {
    try {
      const res = await this.axios.delete(url, { data });
      return this.processApiResponse<T>(res);
    } catch (error: unknown) {
      return this.processApiResponse<T>(error);
    }
  };

  patchData = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<T> => {
    try {
      const res = await this.axios.patch(url, data);
      return this.processApiResponse<T>(res);
    } catch (error: unknown) {
      return this.processApiResponse<T>(error);
    }
  };

  putData = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<T> => {
    try {
      const res = await this.axios.put(url, data);
      return this.processApiResponse<T>(res);
    } catch (error: unknown) {
      return this.processApiResponse<T>(error);
    }
  };

  /** ===== File Download ===== */

  downloadFile = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<ApiResponse<T>> => {
    try {
      const res = await this.axios.get(url, {
        params: { params: JSON.stringify(data) },
        responseType: "arraybuffer"
      });

      const uint8Array = new Uint8Array(res.data);

      if (uint8Array.length > 0) {
        try {
          const jsonString = new TextDecoder().decode(uint8Array);
          res.data = JSON.parse(jsonString);
        } catch {
          res.data = {
            statusCode: 100,
            data: {
              url: URL.createObjectURL(
                new Blob([res.data], {
                  type: res.headers["content-type"]
                })
              ),
              filename:
                res.headers["content-disposition"]
                  ?.split("filename=")[1]
                  ?.replaceAll('"', "") ?? "file"
            },
            message: ""
          };
        }

        return this.processApiResponse<ApiResponse<T>>(res);
      }

      throw new Error("Empty file response");
    } catch (error: unknown) {
      return this.processApiResponse<ApiResponse<T>>(error);
    }
  };

  downloadPdfFile = async (
    url: string,
    data: unknown
  ): Promise<void> => {
    const res = await this.axios.get(url, {
      params: { params: JSON.stringify(data) },
      responseType: "arraybuffer"
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  downloadZipFile = async (
    url: string,
    data: unknown
  ): Promise<void> => {
    const res = await this.axios.get(url, {
      params: { params: JSON.stringify(data) },
      responseType: "arraybuffer"
    });

    const filename =
      res.headers["content-disposition"]
        ?.split("filename=")[1]
        ?.replaceAll('"', "") ?? "file.zip";

    const blob = new Blob([res.data], { type: "application/zip" });
    const fileURL = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = fileURL;
    a.download = filename;
    a.click();
  };

  uploadFile = async <T = unknown>(
    url: string,
    file: File,
    params?: unknown
  ): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);

    if (params) {
      formData.append("params", JSON.stringify(params));
    }

    try {
      const res = await this.axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      return this.processApiResponse<T>(res);
    } catch (error: unknown) {
      return this.processApiResponse<T>(error);
    }
  };

  getImgFileUrl = async (url: string): Promise<string | null> => {
    try {
      const res = await this.axios.get(url, {
        responseType: "arraybuffer"
      });

      return res.data.byteLength !== 0
        ? URL.createObjectURL(
            new Blob([res.data], { type: "image/jpeg" })
          )
        : null;
    } catch (error) {
      throw error;
    }
  };

  /** ===== Response Handler (FIXED) ===== */

  private processApiResponse<T>(
    response: AxiosResponse | unknown
  ): T {
    /** ✅ FIX: correct Axios error check */
    if (axios.isAxiosError(response)) {
      const { code, message, response: res } = response;

      if (code === "ERR_NETWORK") {
        throw { httpStatusCode: 401, message };
      }

      if (res?.status === 401) {
        this.goToLoginPage();
      }

      throw {
        httpStatusCode: res?.status ?? 500,
        message: (res?.data as any)?.message || message
      };
    }

    const res = response as AxiosResponse;

    if (
      res.status >= HttpStatus.OK &&
      res.status < HttpStatus.BAD_REQUEST
    ) {
      return res.data as T;
    }

    throw new HttpReqHandlerError("HttpReqHandlerError", {
      httpStatusCode: res.status,
      message: res.statusText
    });
  }

  /** ===== Navigation ===== */

  private goToLoginPage = (): void => {
    LocalStorageHandler.removeIndex();
    window.location.assign(`${window.location.origin}/login`);
  };
}

/** ===== Instance ===== */
const inst = new HttpRequestHandler(ENV.API_BASE_URL);

/** ===== Export ===== */
export default {
  postData: inst.postData,
  getData: inst.getData,
  deleteData: inst.deleteData,
  patchData: inst.patchData,
  putData: inst.putData,
  downloadFile: inst.downloadFile,
  downloadPdfFile: inst.downloadPdfFile,
  downloadZipFile: inst.downloadZipFile,
  uploadFile: inst.uploadFile,
  getImgFileUrl: inst.getImgFileUrl
};