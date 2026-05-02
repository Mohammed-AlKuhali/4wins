export type ErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_EXPIRED"
  | "AUTH_FAILED"
  | "RATE_LIMITED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "FORBIDDEN"
  | "CONFLICT";

const HTTP_STATUS: Record<ErrorCode, number> = {
  AUTH_REQUIRED: 401,
  AUTH_EXPIRED: 401,
  AUTH_FAILED: 401,
  RATE_LIMITED: 429,
  VALIDATION: 422,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  FORBIDDEN: 403,
  CONFLICT: 409,
};

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function throwApiError(
  code: ErrorCode,
  message: string,
  status?: number,
  fields?: Record<string, string>
): never {
  throw new ApiError(code, message, status ?? HTTP_STATUS[code], fields);
}
