import express from "express";
import { UserController } from "../../controllers/User";
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: User
   *   description: User management APIs
   */

  const router = express.Router();

  /**
   * @swagger
   * /users/get:
   *   get:
   *     summary: Fetch a User
   *     tags: [User]
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
    AuthorizeAccess(["read_user"]),
    UserController.findOne
  );



  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Fetch User by ID
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: User ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: User Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["read_user"]),
    UserController.findById
  );

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Fetch Users
   *     tags: [User]
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
    AuthorizeAccess(["read_user"]),
    UserController.findMany
  );

  /**
   * @swagger
   * /users/create:
   *   post:
   *     summary: Create User
   *     tags: [User]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_user"]),
    UserController.create
  );

  /**
   * @swagger
   * /users/revoke_token:
   *   patch:
   *     summary: Revoke User Token
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Success
   */
  router.patch(
    "/revoke_token",
    AuthenticateUser,
    AuthorizeAccess(["revoke_user_token"]),
    UserController.revokeToken
  );

  /**
   * @swagger
   * /users/change_password:
   *   patch:
   *     summary: Change User Token
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Success
   */
  router.patch(
    "/change_password",
    AuthenticateUser,
    AuthorizeAccess(["change_user_password"]),
    UserController.changeUserPassword
  );

  /**
   * @swagger
   * /users:
   *   put:
   *     summary: Update User
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    // AuthorizeAccess(["write_user"]),
    UserController.update
  );

  /**
   * @swagger
   * /users/me:
   *   put:
   *     summary: Update User (self)
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/me", AuthenticateUser, UserController.updateMe);

  /**
   * @swagger
   * /users/restore:
   *   patch:
   *     summary: Restore User
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: User Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    AuthorizeAccess(["write_user"]),
    UserController.restore
  );

  /**
   * @swagger
   * /users:
   *   delete:
   *     summary: Delete User
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: User Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["delete_user"]),
    UserController.delete
  );

  router.post(
    "/verify",
    AuthenticateUser,
    // AuthorizeAccess(["delete_user"]),
    UserController.toggleIsVerified
  );


  router.post(
    "/filter",
    AuthenticateUser,
    // AuthorizeAccess(["delete_user"]),
    UserController.filterUsers
  );


  return router;
};

export default routes;
