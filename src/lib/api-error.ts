export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const Errors = {
  UNAUTHORIZED: new ApiError("UNAUTHORIZED", "Authentication required", 401),
  CONNECTION_NOT_FOUND: new ApiError(
    "CONNECTION_NOT_FOUND",
    "Connection not found",
    404,
  ),
  SYNC_IN_PROGRESS: new ApiError(
    "SYNC_IN_PROGRESS",
    "Schema sync already running",
    409,
  ),
  QUERY_BLOCKED: new ApiError(
    "QUERY_BLOCKED",
    "Only SELECT queries are permitted",
    403,
  ),
  RATE_LIMITED: new ApiError(
    "RATE_LIMITED",
    "Query limit reached. Try again later",
    429,
  ),
  INVALID_CREDENTIALS: new ApiError(
    "INVALID_CREDENTIALS",
    "Could not connect to database",
    400,
  ),
};
