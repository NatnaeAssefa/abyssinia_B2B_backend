import express from "express";
import { NotificationController } from "../../controllers/System";
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Notification
   *   description: Notification management APIs
   */

  const router = express.Router();

  router.post(
    "/filter",
    AuthenticateUser,
    NotificationController.getClassifiedNotifications
  );

  
  /**
   * @swagger
   * /configs/get:
   *   get:
   *     summary: Fetch a Notification
   *     tags: [Notification]
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
    NotificationController.findOne
  );

  router.get(
    "/my",
    AuthenticateUser,
    NotificationController.findMy
  );

  /**
   * @swagger
   * /configs/{id}:
   *   get:
   *     summary: Fetch Notification by ID
   *     tags: [Notification]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Notification ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Notification Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    NotificationController.findById
  );

  /**
   * @swagger
   * /configs:
   *   get:
   *     summary: Fetch Configs
   *     tags: [Notification]
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
    NotificationController.findMany
  );

  /**
   * @swagger
   * /configs:
   *   post:
   *     summary: Create Notification
   *     tags: [Notification]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    NotificationController.create
  );

  /**
   * @swagger
   * /configs:
   *   put:
   *     summary: Update Notification
   *     tags: [Notification]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    NotificationController.update
  );

  /**
   * @swagger
   * /configs/restore:
   *   patch:
   *     summary: Restore Notification
   *     tags: [Notification]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Notification Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    NotificationController.restore
  );

  /**
   * @swagger
   * /configs:
   *   delete:
   *     summary: Delete Notification
   *     tags: [Notification]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Notification Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    NotificationController.delete
  );

  return router;
};

export default routes;
