import express from "express";
import { FileController } from "../../controllers/System";
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";
import { file_upload } from "../../utilities/fileUpload/upload";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: File
   *   description: File management APIs
   */

  const router = express.Router();

  /**
   * @swagger
   * /files/upload-url:
   *   post:
   *     summary: Upload File from URL
   *     tags: [File]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               file_url:
   *                 type: string
   *                 example: "https://example.com/sample.jpg"
   *                 description: The URL of the file to be uploaded
   *     responses:
   *       201:
   *         description: Success
   *       400:
   *         description: Bad request (missing file URL)
   *       500:
   *         description: Server error
   */
  router.post(
    "/upload-url",
    AuthenticateUser,
    // AuthorizeAccess(["write_file"]),
    FileController.uploadFromUrl
  );

  /**
   * @swagger
   * /files/get:
   *   get:
   *     summary: Fetch a File
   *     tags: [File]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get(
    "/get",
    AuthenticateUser,
    AuthorizeAccess(["read_file"]),
    FileController.findOne
  );

  /**
   * @swagger
   * /files/{id}:
   *   get:
   *     summary: Fetch File by ID
   *     tags: [File]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: File ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: File Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["read_file"]),
    FileController.findById
  );

  /**
   * @swagger
   * /files:
   *   get:
   *     summary: Fetch Files
   *     tags: [File]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get(
    "/",
    AuthenticateUser,
    // AuthorizeAccess(["read_file"]),
    FileController.findMany
  );

  /**
   * @swagger
   * /files:
   *   post:
   *     summary: Create File
   *     tags: [File]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/single",
    file_upload.single("file"),
    AuthenticateUser,
    // AuthorizeAccess(["write_file"]),
    FileController.create
  );

  router.post(
    "/path",
    // file_upload.single("file"),
    AuthenticateUser,
    AuthorizeAccess(["write_file"]),
    FileController.create_with_path
  );

  /**
   * @swagger
   * /files/multiple:
   *   post:
   *     summary: Create Files
   *     tags: [File]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/multiple",
    file_upload.array("files"),
    AuthenticateUser,
    // AuthorizeAccess(["write_file"]),
    FileController.createBulk
  );

  /**
   * @swagger
   * /files:
   *   put:
   *     summary: Update File
   *     tags: [File]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_file"]),
    FileController.update
  );

  /**
   * @swagger
   * /files/restore:
   *   patch:
   *     summary: Restore File
   *     tags: [File]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: File Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    AuthorizeAccess(["write_file"]),
    FileController.restore
  );

  /**
   * @swagger
   * /files:
   *   delete:
   *     summary: Delete File
   *     tags: [File]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: File Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["delete_file"]),
    FileController.delete
  );

  return router;
};

export default routes;
