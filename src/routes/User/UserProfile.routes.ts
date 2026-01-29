import express from "express";
import { UserProfileController } from "../../controllers/User";

import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: UserProfile
   *   description: UserProfile management APIs
   */

  const router = express.Router();

  /**
   * @swagger
   * /UserProfiles/get:
   *   get:
   *     summary: Fetch a UserProfile
   *     tags: [UserProfile]
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
    UserProfileController.findOne
  );

  router.get(
    "/profile",
    AuthenticateUser,
    UserProfileController.findMyProfile
  );

  /**
   * @swagger
   * /UserProfiles/{id}:
   *   get:
   *     summary: Fetch UserProfile by ID
   *     tags: [UserProfile]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: UserProfile ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: UserProfile Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    UserProfileController.findById
  );

  /**
   * @swagger
   * /UserProfiles:
   *   get:
   *     summary: Fetch UserProfiles
   *     tags: [UserProfile]
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
    UserProfileController.findMany
  );

  /**
   * @swagger
   * /UserProfiles:
   *   post:
   *     summary: Create UserProfile
   *     tags: [UserProfile]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    UserProfileController.create
  );

  /**
   * @swagger
   * /UserProfiles:
   *   put:
   *     summary: Update UserProfile
   *     tags: [UserProfile]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    UserProfileController.update
  );

  /**
   * @swagger
   * /UserProfiles/restore:
   *   patch:
   *     summary: Restore UserProfile
   *     tags: [UserProfile]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: UserProfile Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    UserProfileController.restore
  );

  /**
   * @swagger
   * /UserProfiles:
   *   delete:
   *     summary: Delete UserProfile
   *     tags: [UserProfile]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: UserProfile Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    UserProfileController.delete
  );

  return router;
};

export default routes;
