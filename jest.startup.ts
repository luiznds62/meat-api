import * as jestCli from "jest-cli";

import { Server } from "./server/server";
import { environment } from "./common/environment";
import { usersRouter } from "./users/users.router";
import { reviewsRouter } from "./reviews/review.router";
import { restaurantsRouter } from "./restaurants/restaurant.router";
import { User } from "./users/users.model";
import { Review } from "./reviews/review.model";
import { Restaurant } from "./restaurants/restaurant.model";

let server: Server;
const beforeAllTests = () => {
  environment.db.url =
    process.env.DB_URL || "mongodb://localhost/meat-api-test-db";
  environment.server.port = process.env.SERVER_PORT || 3001;
  server = new Server();
  return server
    .bootstrap([usersRouter, reviewsRouter, restaurantsRouter])
    .then(() => User.remove({}).exec())
    .then(() => Review.remove({}).exec())
    .then(() => Restaurant.remove({}).exec());
};

const afterAllTests = () => {
  return server.shutdown();
};

beforeAllTests()
  .then(() => jestCli.run())
  .then(() => afterAllTests())
  .catch(console.error);
