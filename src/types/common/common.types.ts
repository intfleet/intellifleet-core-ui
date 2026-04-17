
export type HttpErrorProps = {
  httpStatusCode?: number;
  message?: string;
  [key: string]: unknown;
};


export type ImportAppMetaEnv = {
  API_BASE_URL?: string
}