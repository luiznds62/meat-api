"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const restify = require("restify");
//import * as corsMiddleware from "restify-cors-middleware";
const mongoose = require("mongoose");
const fs = require("fs");
const environment_1 = require("../common/environment");
const logger_1 = require("../common/logger");
const merge_patch_parser_1 = require("./merge-patch.parser");
const token_parser_1 = require("../security/token.parser");
const error_handler_1 = require("./error.handler");
class Server {
    initializeDb() {
        mongoose.Promise = global.Promise;
        mongoose.set("useCreateIndex", true);
        mongoose.set("useFindAndModify", false);
        return mongoose.connect(environment_1.environment.db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    initRoutes(routers) {
        return new Promise((resolve, reject) => {
            try {
                const options = {
                    name: "meat-api",
                    version: "1.0.0",
                    log: logger_1.logger,
                };
                if (environment_1.environment.security.enableHTTPS) {
                    options.certificate = fs.readFileSync(environment_1.environment.security.certificate);
                    options.key = fs.readFileSync(environment_1.environment.security.key);
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
                this.application.use(merge_patch_parser_1.mergePatchBodyParser);
                this.application.use(token_parser_1.tokenParser);
                //routes
                for (let router of routers) {
                    router.applyRoutes(this.application);
                }
                this.application.listen(environment_1.environment.server.port, () => {
                    resolve(this.application);
                });
                this.application.on("restifyError", error_handler_1.handleError);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    bootstrap(routers = []) {
        return this.initializeDb().then(() => this.initRoutes(routers).then(() => this));
    }
    shutdown() {
        return mongoose.disconnect().then(() => this.application.close());
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map