import express from "express";
import { CategoryController } from "../../controllers/MarketPlace";

import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: AccessRule
   *   description: Access Rule management APIs
   */

  const router = express.Router();

  /**
   * @swagger
   * /access_rules/get:
   *   get:
   *     summary: Fetch a Access Rule
   *     tags: [AccessRule]
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
    // AuthenticateUser,
    // AuthorizeAccess(["read_access_rule"]),
    CategoryController.findOne
  );

  /**
   * @swagger
   * /access_rules/{id}:
   *   get:
   *     summary: Fetch Access Rule by ID
   *     tags: [AccessRule]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Access Rule ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Access Rule Not Found
   */
  router.get(
    "/:id",
    // AuthenticateUser,
    // AuthorizeAccess(["read_access_rule"]),
    CategoryController.findById
  );

  /**
   * @swagger
   * /access_rules:
   *   get:
   *     summary: Fetch Access Rules
   *     tags: [AccessRule]
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
    // AuthenticateUser,
    // AuthorizeAccess(["read_access_rule"]),
    CategoryController.findMany
  );

  /**
   * @swagger
   * /access_rules:
   *   post:
   *     summary: Create Access Rule
   *     tags: [AccessRule]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_access_rule"]),
    CategoryController.create
  );

  /**
   * @swagger
   * /access_rules:
   *   put:
   *     summary: Update Access Rule
   *     tags: [AccessRule]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_access_rule"]),
    CategoryController.update
  );

  /**
   * @swagger
   * /access_rules/restore:
   *   patch:
   *     summary: Restore Access Rule
   *     tags: [AccessRule]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Access Rule Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    AuthorizeAccess(["write_access_rule"]),
    CategoryController.restore
  );

  /**
   * @swagger
   * /access_rules:
   *   delete:
   *     summary: Delete Access Rule
   *     tags: [AccessRule]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Access Rule Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["delete_access_rule"]),
    CategoryController.delete
  );

  return router;
};

export default routes;
