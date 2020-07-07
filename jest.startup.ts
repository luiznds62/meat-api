import * as jestcli from "jest-cli";
import { Server } from "./server/server";
import { environment } from "./common/environment";
import { usersRouter } from "./users/users.router";
import { Review } from "./reviews/review.model";
import { User } from "./users/users.model";
import { Restaurant } from "./restaurants/restaurant.model";
import { reviewsRouter } from "./reviews/review.router";
import { restaurantsRouter } from "./restaurants/restaurant.router";

let server: Server;
let address: string = "http://localhost:3001";

const beforeAllTests = () => {
  environment.db.url =
    process.env.DB_URL || "mongodb://localhost/meat-api-test-db";
  environment.server.port = process.env.SERVER_PORT || 3001;
  server = new Server();
  return server
    .bootstrap([usersRouter, reviewsRouter, restaurantsRouter])
    .then(() => {
      User.remove({}).exec();
      Review.remove({}).exec();
      Restaurant.remove({}).exec();
    })
    .catch(console.error);
};

const afterAllTests = () => {
  return server.shutdown();
};

beforeAllTests()
  .then(() => jestcli.run())
  .then(() => {
    afterAllTests();
  })
  .catch(console.error);
