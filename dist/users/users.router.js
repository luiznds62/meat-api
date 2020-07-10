"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const model_router_1 = require("../common/model-router");
const users_model_1 = require("./users.model");
const auth_handler_1 = require("../security/auth.handler");
const authz_handler_1 = require("../security/authz.handler");
const restify_errors_1 = require("restify-errors");
class UsersRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User);
        this.verifyUser = (req, resp, next) => {
            users_model_1.User.findOne({ _id: req.params.id }).then((user) => {
                if (user) {
                    if (req.authenticated.profiles.find((p) => p == "admin") != undefined ||
                        req.params.id == req.authenticated._id) {
                        next();
                    }
                    else {
                        next(new restify_errors_1.ForbiddenError("Acesso negado"));
                    }
                }
                else {
                    next(new restify_errors_1.NotFoundError("Documento não encontrado"));
                }
            });
        };
        this.findByEmail = (req, resp, next) => {
            if (req.query.email) {
                users_model_1.User.findByEmail(req.query.email)
                    .then((user) => (user ? [user] : []))
                    .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.url,
                }))
                    .catch(next);
            }
            else {
                this.findAll(req, resp, next);
            }
        };
        this.on("beforeRender", (document) => {
            document.password = undefined;
        });
    }
    applyRoutes(application) {
        application.get(this.basePath, [
            authz_handler_1.authorize("admin"),
            this.findByEmail,
            this.findAll,
        ]);
        application.get(`${this.basePath}/:id`, [
            authz_handler_1.authorize("admin", "user"),
            this.validateId,
            this.verifyUser,
            this.findById,
        ]);
        application.post(this.basePath, [authz_handler_1.authorize("admin"), this.save]);
        application.put(`${this.basePath}/:id`, [
            authz_handler_1.authorize("admin", "user"),
            this.validateId,
            this.verifyUser,
            this.replace,
        ]);
        application.patch(`${this.basePath}/:id`, [
            authz_handler_1.authorize("admin", "user"),
            this.validateId,
            this.verifyUser,
            this.update,
        ]);
        application.del(`${this.basePath}/:id`, [
            authz_handler_1.authorize("admin"),
            this.validateId,
            this.delete,
        ]);
        application.post(`${this.basePath}/authenticate`, auth_handler_1.authenticate);
    }
}
exports.usersRouter = new UsersRouter();
//# sourceMappingURL=users.router.js.map