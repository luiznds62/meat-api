import "jest";
import * as request from "supertest";
import { Server } from "../server/server";
import { environment } from "../common/environment";
import { reviewsRouter } from "../reviews/review.router";
import { Review } from "../reviews/review.model";

const endpoint = "/reviews";
let address: string = (<any>global).address;

test("get /reviews", () => {
  return request(address)
    .get(endpoint)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    })
    .catch(fail);
});
