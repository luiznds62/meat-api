import * as restify from "restify";
//import * as corsMiddleware from "restify-cors-middleware";
import * as mongoose from "mongoose";
import * as fs from "fs";

import { environment } from "../common/environment";
import { logger } from "../common/logger";
import { Router } from "../common/router";
import { mergePatchBodyParser } from "./merge-patch.parser";
import { tokenParser } from "../security/token.parser";
import { handleError } from "./error.handler";

export class Server {
  application: restify.Server;

  initializeDb(): Promise<mongoose.Mongoose> {
    (<any>mongoose).Promise = global.Promise;
    mongoose.set("useCreateIndex", true);
    mongoose.set("useFindAndModify", false);
    return mongoose.connect(environment.db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  initRoutes(routers: Router[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const options: restify.ServerOptions = {
          name: "meat-api",
          version: "1.0.0",
          log: logger,
        };

        if (environment.security.enableHTTPS) {
          options.certificate = fs.readFileSync(
            environment.security.certificate
          );
          options.key = fs.readFileSync(environment.security.key);
        }

        this.application = restify.createServer(options);

        // No mesmo domínio não precisa
        /*const corsOption: corsMiddleware.Options = {
          preflightMaxAge: 86400,
          origins: ["*"],
          allowHeaders: ["authorization"],
          exposeHeaders: [""],
        };

        const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOption);*/

        //this.application.pre(cors.preflight);
        //this.application.use(cors.actual);
        this.application.use(restify.plugins.queryParser());
        this.application.use(restify.plugins.bodyParser());
        this.application.use(mergePatchBodyParser);
        this.application.use(tokenParser);

        //routes
        for (let router of routers) {
          router.applyRoutes(this.application);
        }

        this.application.listen(environment.server.port, () => {
          resolve(this.application);
        });

        this.application.on("restifyError", handleError);
      } catch (error) {
        reject(error);
      }
    });
  }

  bootstrap(routers: Router[] = []): Promise<Server> {
    return this.initializeDb().then(() =>
      this.initRoutes(routers).then(() => this)
    );
  }

  shutdown() {
    return mongoose.disconnect().then(() => this.application.close());
  }
}
