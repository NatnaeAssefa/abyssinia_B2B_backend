import { Application } from "express";

import authRoutes from "./Auth";
import systemRoutes from "./System";
import userRoutes from "./User";
import marketPlaceRoutes from "./MarketPlace";

import { constants } from "../config";
import { ConfigDAL } from "../dals/System";
import { SystemService } from "../services/System";

const routes = (app: Application) => {
  app.use(marketPlaceRoutes());
  app.use(authRoutes());
  app.use(systemRoutes());
  app.use(userRoutes());

  /**
   * @swagger
   * tags:
   *   name: Test
   *   description: Test APIs
   */

  app.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      data: { name: "Read-Sea API", version: "1.0.0" },
      message: "Success",
    });
  });

  app.get("/system/init/748596123852", (req, res) => {
    ConfigDAL.findOne({
      where: {
        key: constants.SYSTEM_CONFIG_KEY,
      },
    })
      .then((config) => {
        if (config && config.value === constants.SYSTEM_CONFIG_VALUE) {
          res.status(404).json({
            status: 404,
            data: "__null__",
            message: "Invalid endpoint",
          });
        } else {
          SystemService.initSystem()
            .then((e) => {
              res.status(200).json({
                status: 200,
                data: null,
                message: "Success",
              });
            })
            .catch((error) => {
              res.status(500).json({
                status: 500,
                data: error,
                message: "Internal Server Error",
              });
            });
        }
      })
      .catch((error) => {
        res.status(500).json({
          status: 500,
          data: error,
          message: "Internal Server Error",
        });
      });
  });

  app.get("/loaderio-/", (req, res) => {
    res.download(
      "/api/data/loader.io/loaderio-3b0c6884f8e5f1898c79ba1e58b88bc1.txt"
    );
  });
};

export default routes;
