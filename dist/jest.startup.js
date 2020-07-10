"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jestCli = require("jest-cli");
const server_1 = require("./server/server");
const environment_1 = require("./common/environment");
const users_router_1 = require("./users/users.router");
const review_router_1 = require("./reviews/review.router");
const restaurant_router_1 = require("./restaurants/restaurant.router");
const users_model_1 = require("./users/users.model");
const review_model_1 = require("./reviews/review.model");
const restaurant_model_1 = require("./restaurants/restaurant.model");
let server;
const beforeAllTests = () => {
    environment_1.environment.db.url =
        process.env.DB_URL || "mongodb://localhost/meat-api-test-db";
    environment_1.environment.server.port = process.env.SERVER_PORT || 3001;
    server = new server_1.Server();
    return server
        .bootstrap([users_router_1.usersRouter, review_router_1.reviewsRouter, restaurant_router_1.restaurantsRouter])
        .then(() => users_model_1.User.deleteMany({}).exec())
        .then(() => {
        let admin = new users_model_1.User();
        admin.name = "admin";
        admin.email = "admin@hotmail.com";
        admin.password = "123456";
        admin.gender = "Male";
        admin.cpf = "81947876023";
        admin.profiles = ["admin", "user"];
        return admin.save();
    })
        .then(() => review_model_1.Review.deleteMany({}).exec())
        .then(() => restaurant_model_1.Restaurant.deleteMany({}).exec());
};
const afterAllTests = () => {
    return server.shutdown();
};
beforeAllTests()
    .then(() => jestCli.run())
    .then(() => afterAllTests())
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=jest.startup.js.map