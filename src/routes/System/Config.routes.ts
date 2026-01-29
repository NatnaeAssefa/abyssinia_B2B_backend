import express from "express";
import { ConfigController } from "../../controllers/System";
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Config
   *   description: Config management APIs
   */

  const router = express.Router();

  /**
   * @swagger
   * /configs/get:
   *   get:
   *     summary: Fetch a Config
   *     tags: [Config]
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
    AuthorizeAccess(["read_config"]),
    ConfigController.findOne
  );

  /**
   * @swagger
   * /configs/{id}:
   *   get:
   *     summary: Fetch Config by ID
   *     tags: [Config]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Config ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Config Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["read_config"]),
    ConfigController.findById
  );

  /**
   * @swagger
   * /configs:
   *   get:
   *     summary: Fetch Configs
   *     tags: [Config]
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
    AuthorizeAccess(["read_config"]),
    ConfigController.findMany
  );

  /**
   * @swagger
   * /configs:
   *   post:
   *     summary: Create Config
   *     tags: [Config]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_config"]),
    ConfigController.create
  );

  /**
   * @swagger
   * /configs:
   *   put:
   *     summary: Update Config
   *     tags: [Config]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_config"]),
    ConfigController.update
  );

  /**
   * @swagger
   * /configs/restore:
   *   patch:
   *     summary: Restore Config
   *     tags: [Config]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Config Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    AuthorizeAccess(["write_config"]),
    ConfigController.restore
  );

  /**
   * @swagger
   * /configs:
   *   delete:
   *     summary: Delete Config
   *     tags: [Config]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Config Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["delete_config"]),
    ConfigController.delete
  );

  return router;
};

export default routes;
