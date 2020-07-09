import { ModelRouter } from "../common/model-router";
import * as restify from "restify";
import { User } from "./users.model";
import { authenticate } from "../security/auth.handler";
import { authorize } from "../security/authz.handler";
import { NotFoundError, ForbiddenError } from "restify-errors";

class UsersRouter extends ModelRouter<User> {
  constructor() {
    super(User);
    this.on("beforeRender", (document) => {
      document.password = undefined;
    });
  }

  verifyUser = (req: restify.Request, resp, next) => {
    User.findOne({ _id: req.params.id }).then((user) => {
      if (user) {
        if (
          req.authenticated.profiles.find((p) => p == "admin") != undefined ||
          req.params.id == req.authenticated._id
        ) {
          next();
        } else {
          next(new ForbiddenError("Acesso negado"));
        }
      } else {
        next(new NotFoundError("Documento não encontrado"));
      }
    });
  };

  findByEmail = (req, resp, next) => {
    if (req.query.email) {
      User.findByEmail(req.query.email)
        .then((user) => (user ? [user] : []))
        .then(
          this.renderAll(resp, next, {
            pageSize: this.pageSize,
            url: req.url,
          })
        )
        .catch(next);
    } else {
      this.findAll(req, resp, next);
    }
  };

  applyRoutes(application: restify.Server) {
    application.get(
      { path: this.basePath, version: "2.0.0" },
      authorize("admin"),
      this.findByEmail
    );
    application.get({ path: this.basePath, version: "1.0.0" }, [
      authorize("admin"),
      this.findAll,
    ]);
    application.get(`${this.basePath}/:id`, [
      authorize("admin", "user"),
      this.validateId,
      this.verifyUser,
      this.findById,
    ]);
    application.post(this.basePath, [authorize("admin"), this.save]);
    application.put(`${this.basePath}/:id`, [
      authorize("admin", "user"),
      this.validateId,
      this.verifyUser,
      this.replace,
    ]);
    application.patch(`${this.basePath}/:id`, [
      authorize("admin", "user"),
      this.validateId,
      this.verifyUser,
      this.update,
    ]);
    application.del(`${this.basePath}/:id`, [
      authorize("admin"),
      this.validateId,
      this.delete,
    ]);
    application.post(`${this.basePath}/authenticate`, authenticate);
  }
}

export const usersRouter = new UsersRouter();
