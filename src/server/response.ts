import { Response } from "express";

export interface apiResponse {
  message: string;
  data: any;
  status: number;
}

export interface apiError {
  message: string;
  error: any;
  status: number;
}

export const ErrInternalServer = new Error("Internal server error");
export const ErrNotFound = new Error("Not found");
export const ErrBadRequest = new Error("Bad request");
export const ErrUnauthorized = new Error("Unauthorized");
export const httpInternalServerError = 500;
export const httpNotFound = 404;
export const httpBadRequest = 400;
export const httpUnauthorized = 401;
export const httpOK = 200;

const jsonError = (res: Response, data: apiError) => {
  res.status(data.status).json(data);
};

// send a 500 internal server error response to the client
export const InternalServerError = (res: Response, msg: string) => {
  jsonError(res, {
    message: msg,
    error: "internal server error",
    status: httpInternalServerError,
  });
};
// send a 400 bad request response to the client
export const BadRequest = (res: Response, msg: string) => {
  jsonError(res, {
    message: msg,
    error: "bad request",
    status: httpBadRequest,
  });
};
// send a 404 not found response to the client
export const NotFound = (res: Response, msg: string) => {
  jsonError(res, {
    message: msg,
    error: "not found",
    status: httpNotFound,
  });
};

