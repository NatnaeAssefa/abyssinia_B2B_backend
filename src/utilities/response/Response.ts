import { Response } from "express";
import LogService, {
  filter,
  RequestAttributes,
  ResponseAttributes,
} from "../../services/Log/Log.service";
import { env } from "../../config";
import TelegramBot from "../telegram/telegram";

type ErrorStatusCode = 400 | 401 | 404 | 403 | 500;
const ErrorStatusCodes = [400, 401, 404, 403, 500];
type SuccessStatusCode = 200 | 201 | 300;
const SuccessStatusCodes = [200, 201, 300];

type ResponseObject = {
  status: SuccessStatusCode | ErrorStatusCode;
  message?: string;
  data: any;
  error: any;
};

export default (
  req: any,
  res: Response,
  status: SuccessStatusCode | ErrorStatusCode,
  data: any,
  message: string,
  start_time: Date,
  type = "json"
) => {
  try {
    const responseObj: ResponseObject = {
      status: status,
      message: message,
      data: undefined,
      error: undefined,
    };
    if (SuccessStatusCodes.indexOf(status) !== -1) {
      responseObj.data = data;
    } else if (ErrorStatusCodes.indexOf(status) !== -1) {
      responseObj.error =
        false && env.PRODUCTION && status === 500
          ? { timestamp: new Date(), errors: ["Something Went Wrong"] }
          : data;
    }
    if (type === "json") {
      res.status(status).json(responseObj);
    } else if (type === "view") {
      res.render(message || "welcome", data);
    } else {
      res.status(status).json(responseObj);
    }
  } catch (e) {
    console.log(e);
    (async () => {
      // Send the message using the static method
      await TelegramBot.sendJsonMessage({
        error: e,
        time: new Date().toString(),
      });
    })();
  }
  if (SuccessStatusCodes.indexOf(status) !== -1) {
    LogService.LogRequest(req, res, start_time, new Date());
  } else if (ErrorStatusCodes.indexOf(status) !== -1) {
    LogService.LogRequestError(
      { data: data, message: message },
      res,
      new Date()
    );

    (async () => {
      // Send the message using the static method
      await TelegramBot.sendJsonMessage({
        request: filter(req, RequestAttributes),
        response: filter(res, ResponseAttributes),
        start_time: start_time,
        data: data,
        message: message,
        time: new Date(),
      });
    })();
  }
};
