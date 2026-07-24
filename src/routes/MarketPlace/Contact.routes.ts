import express from "express";
import ContactController from "../../controllers/MarketPlace/Contact.controller";

const routes = () => {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   name: Contact
   *   description: Public contact, RFQ, and registration submissions
   */

  router.post("/inquiry", ContactController.submitInquiry);
  router.post("/quote", ContactController.submitQuote);
  router.post("/registration", ContactController.submitRegistration);

  return router;
};

export default routes;
