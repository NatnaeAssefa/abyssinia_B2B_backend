import express from "express";
import configRoutes from "./Config.routes";
import fileRoutes from "./File.routes";
import notificationRoutes from "./Notification.routes";


const routes = () => {
  const router = express.Router();

  router.use("/files", fileRoutes());
  router.use("/configs", configRoutes());
  router.use("/notification", notificationRoutes());

  return router;
};

export default routes;
