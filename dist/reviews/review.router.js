"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRouter = void 0;
const model_router_1 = require("../common/model-router");
const review_model_1 = require("./review.model");
const authz_handler_1 = require("../security/authz.handler");
class ReviewsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(review_model_1.Review);
    }
    prepareOne(query) {
        return query.populate("user").populate("restaurant");
    }
    prepareMany(query) {
        return query.populate("user").populate("restaurant");
    }
    applyRoutes(application) {
        application.get(this.basePath, this.findAll);
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        application.post(this.basePath, [authz_handler_1.authorize("admin"), this.save]);
        application.put(`${this.basePath}/:id`, [
            authz_handler_1.authorize("admin"),
            this.validateId,
            this.replace,
        ]);
        application.del(`${this.basePath}/:id`, [
            authz_handler_1.authorize("admin"),
            this.validateId,
            this.delete,
        ]);
    }
}
exports.reviewsRouter = new ReviewsRouter();
//# sourceMappingURL=review.router.js.map