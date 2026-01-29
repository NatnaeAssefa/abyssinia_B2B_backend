import express from "express";
import { ActionLogController } from "../../controllers/User";

import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: ActionLog
   *   description: ActionLog management APIs
   */

  const router = express.Router();

  /**
   * @swagger
   * /action_logs/get:
   *   get:
   *     summary: Fetch a Action Log
   *     tags: [ActionLog]
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
    AuthorizeAccess(["read_action_log"]),
    ActionLogController.findOne
  );

  /**
   * @swagger
   * /action_logs/{id}:
   *   get:
   *     summary: Fetch Action Log by ID
   *     tags: [ActionLog]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Action Log ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Action Log Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["read_action_log"]),
    ActionLogController.findById
  );

  /**
   * @swagger
   * /action_logs:
   *   get:
   *     summary: Fetch Action Logs
   *     tags: [ActionLog]
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
    // AuthorizeAccess(["read_action_log"]),
    ActionLogController.findMany
  );

  /**
   * @swagger
   * /action_logs:
   *   post:
   *     summary: Create Action Log
   *     tags: [ActionLog]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_action_log"]),
    ActionLogController.create
  );

  /**
   * @swagger
   * /action_logs:
   *   put:
   *     summary: Update Action Log
   *     tags: [ActionLog]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_action_log"]),
    ActionLogController.update
  );

  /**
   * @swagger
   * /action_logs/restore:
   *   patch:
   *     summary: Restore Action Log
   *     tags: [ActionLog]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Action Log Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    AuthorizeAccess(["write_action_log"]),
    ActionLogController.restore
  );

  /**
   * @swagger
   * /action_logs:
   *   delete:
   *     summary: Delete Action Log
   *     tags: [ActionLog]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Action Log Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["delete_action_log"]),
    ActionLogController.delete
  );

  return router;
};

export default routes;
