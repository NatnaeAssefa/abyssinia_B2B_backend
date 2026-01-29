import { Request, Response } from "express";
import { FileService } from "../../services/System";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";
import { addWaterMarkToImage } from "../../utilities/fileUpload/watermark";
import axios from "axios";
import path from 'path';
import fs from 'fs';
import LogService from "../../services/Log/Log.service";

const ModelName = "File";

class FileController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    FileService.findMany(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static findOne(request: Request, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

    FileService.findOne(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static findById(request: Request, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      let id: string = request.params.id;
      let parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
      FileService.findById(id, parsedQuery.query, parsedQuery.paranoid)
        .then((result) => {
          if (result) {
            ServerResponse(request, response, 200, result, "", startTime);
          } else {
            ServerResponse(
              request,
              response,
              404,
              null,
              `${ModelName} Not Found`,
              startTime
            );
          }
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
      return;
    }
  }

  static async create(request: any, response: Response): Promise<void> {
    const startTime = new Date();
    let _file = request.file;

    if (!_file) {
      ServerResponse(request, response, 400, null, 'No file uploaded.', startTime);
      return;
    }

    try {
      // Add watermark to the uploaded image
      const watermarkedFilePath = await addWaterMarkToImage(_file.path);

      if (!watermarkedFilePath) {
        ServerResponse(
          request,
          response,
          500,
          'Failed to process the file.',
          'Error',
          startTime
        );
        return
      }

      // Update file details to use the watermarked file
      const original_file = {
        name: _file.originalname,
        type: _file.mimetype,
        size: _file.size,
        path: _file.path,
      }

      const watermarked_file: any = {
        ...original_file,
        path: watermarkedFilePath,
      };



      const user: User = request.user;

      // Save original path as well
      const original_image = await FileService.create(user, original_file as any);

      // Save the file details using FileService
      const result = await FileService.create(user, watermarked_file);


      // Send success response
      ServerResponse(request, response, 201, result, 'Success', startTime);
    } catch (error: any) {
      console.error('Error in FileController.create:', error);

      // Send error response
      ServerResponse(
        request,
        response,
        error?.statusCode || 500,
        error?.payload || 'Failed to process the file.',
        'Error',
        startTime
      );
    }
  }

  static async uploadFromUrl(request: any, response: Response): Promise<any> {
    const startTime = new Date();
    const { file_urls } = request.body;

    if (!file_urls || !Array.isArray(file_urls)) {
      return ServerResponse(request, response, 400, null, 'File URLs array is required.', startTime);
    }

    try {
      const user: User = request.user;
      const uploadedFiles = await Promise.all(
        file_urls.map(async (file_url: string) => {
          try {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileName = `file-${uniqueSuffix}.png`;
            const tempFilePath = `uploads/${fileName}`;

            const writer = fs.createWriteStream(tempFilePath);
            const { data } = await axios({
              method: 'GET',
              url: file_url,
              responseType: 'stream',
            });
            data.pipe(writer);

            await new Promise<void>((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            const watermarkedFilePath = await addWaterMarkToImage(tempFilePath);
            if (!watermarkedFilePath) {
                LogService.LogError(`Failed to process the file from uploadFromUrl for ${file_url}, ${tempFilePath}`);
                throw new Error('Failed to process the file.');
            }

            const fileData: any = await FileService.saveFileFromUrl(user, file_url, tempFilePath, watermarkedFilePath);

            return {
              id: fileData.watermarked.id,
              name: path.basename(fileData.watermarked.path),
              type: fileData.watermarked.type,
              size: fileData.watermarked.size,
              path: fileData.watermarked.path.replace(/\\/g, '/'),
              updatedAt: fileData.watermarked.updatedAt,
              createdAt: fileData.watermarked.createdAt,
              deletedAt: fileData.watermarked.deletedAt,
            };
          } catch (error) {
            console.error(`Error processing file ${file_url}:`, error);
            return null;
          }
        })
      );

      const successfulUploads = uploadedFiles.filter(file => file !== null);
      ServerResponse(request, response, 201, successfulUploads, 'Success', startTime);
      return successfulUploads;
    } catch (error: any) {
      console.error('Error in FileController.uploadFromUrl:', error);
      ServerResponse(request, response, 500, null, 'Error processing file upload.', startTime);
      return null;
    }
  }

  static create_with_path(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      size: Joi.number().required(),
      path: Joi.string().required(),
    });
    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      let _file = request.body;
      let file: any = {
        name: _file?.name,
        type: _file?.type,
        size: _file?.size,
        path: _file?.path,
      };
      console.log(file);
      const user: User = request.user;
      FileService.create(user, file)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static createBulk(request: any, response: Response) {
    const startTime = new Date();

    let files: any = [];
    // The issue is here - incorrect iteration through files array
    // Change from:
    // for (let x in (request.files ?? []).length) {
    // To:
    for (let x = 0; x < (request.files ?? []).length; x++) {
      let file = request.files[x];
      files.push({
        name: file?.originalname,
        type: file?.mimetype,
        size: file?.size,
        path: file?.path,
      });
    }
    const user: User = request.user;
    FileService.createBulk(user, files)
      .then((result) => {
        ServerResponse(request, response, 201, result, "Success", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static update(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      name: Joi.string(),
      value: Joi.string(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      FileService.update(user, id, data)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static delete(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      force: Joi.boolean(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const force: boolean = request.body.force ?? false;
      const user: User = request.user;
      FileService.delete(user, id, null, force)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static restore(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const user: User = request.user;
      FileService.restore(user, id)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }
}

export default FileController;
