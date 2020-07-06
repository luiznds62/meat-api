import { ModelRouter } from "../common/model-router";
import * as restify from "restify";
import { Review } from "./review.model";
import * as mongoose from "mongoose";

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
    application.get("/reviews", this.findAll);
    application.get("/reviews/:id", [this.validateId, this.findById]);
    application.post("/reviews", this.save);
    application.put("/reviews/:id", [this.validateId, this.replace]);
    application.del("/reviews/:id", [this.validateId, this.delete]);
  }
}

export const reviewsRouter = new ReviewsRouter();
