import { ModelRouter } from "../common/model-router";
import * as restify from "restify";
import { Review } from "./review.model";
import * as mongoose from "mongoose";
import { authorize } from "../security/authz.handler";

class ReviewsRouter extends ModelRouter<Review> {
  constructor() {
    super(Review);
  }

  protected prepareOne(
    query: mongoose.DocumentQuery<Review, Review>
  ): mongoose.DocumentQuery<Review, Review> {
    return query.populate("user").populate("restaurant");
  }

  protected prepareMany(
    query: mongoose.DocumentQuery<Review[], Review>
  ): mongoose.DocumentQuery<Review[], Review> {
    return query.populate("user").populate("restaurant");
  }

  applyRoutes(application: restify.Server) {
    application.get(this.basePath, this.findAll);
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
    application.post(this.basePath, [authorize("admin"), this.save]);
    application.put(`${this.basePath}/:id`, [
      authorize("admin"),
      this.validateId,
      this.replace,
    ]);
    application.del(`${this.basePath}/:id`, [
      authorize("admin"),
      this.validateId,
      this.delete,
    ]);
  }
}

export const reviewsRouter = new ReviewsRouter();
