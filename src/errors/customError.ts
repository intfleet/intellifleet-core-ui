
import * as Types from '@/types/common';

class HttpReqHandlerError extends Error {
  public props: Types.HttpErrorProps;

  constructor(message: string, props: Types.HttpErrorProps = {}) {
    super(message);

    this.name = "HttpReqHandlerError";
    this.props = props;

    // 👇 Fix prototype chain issue (important in TS)
    Object.setPrototypeOf(this, HttpReqHandlerError.prototype);
  }
}

export { HttpReqHandlerError };