"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server/server");
const users_router_1 = require("./users/users.router");
const restaurant_router_1 = require("./restaurants/restaurant.router");
const review_router_1 = require("./reviews/review.router");
const main_router_1 = require("./main.router");
const server = new server_1.Server();
server
    .bootstrap([users_router_1.usersRouter, restaurant_router_1.restaurantsRouter, review_router_1.reviewsRouter, main_router_1.mainRouter])
    .then((server) => {
    console.log("Server is listening on:", server.application.address());
})
    .catch((error) => {
    console.log("Server failed to start");
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map