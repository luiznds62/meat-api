import "jest";
import * as request from "supertest";
import { Server } from "../server/server";
import { environment } from "../common/environment";
import { usersRouter } from "../users/users.router";
import { User } from "../users/users.model";

const endpoint = "/users";
let address: string = (<any>global).address;
let server: Server;

test("get /users", () => {
  return request(address)
    .get(endpoint)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    })
    .catch(fail);
});

test("post /users", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user",
      email: "test@email.com",
      password: "test",
      cpf: "05533338012",
    })
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe("Test user");
      expect(response.body.email).toBe("test@email.com");
      expect(response.body.cpf).toBe("05533338012");
      expect(response.body.password).toBeUndefined();
    })
    .catch(fail);
});

test("post /users - email invalid", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user",
      email: "emailerror",
      password: "test",
      cpf: "32289607061",
    })
    .then((response) => {
      expect(response.status).toBe(400);
    })
    .catch(fail);
});

test("post /users - name min length", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Te",
      email: "test3@email.com",
      password: "test",
      cpf: "82358826049",
    })
    .then((response) => {
      expect(response.status).toBe(400);
    })
    .catch(fail);
});

test("post /users - name max length", () => {
  return request(address)
    .post(endpoint)
    .send({
      name:
        "Tessssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssste",
      email: "test3@email.com",
      password: "test",
      cpf: "82358826049",
    })
    .then((response) => {
      expect(response.status).toBe(400);
    })
    .catch(fail);
});

test("post /users - cpf invalid", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Teste user",
      email: "test4@email.com",
      password: "test",
      cpf: "1234",
    })
    .then((response) => {
      expect(response.status).toBe(400);
    })
    .catch(fail);
});

test("post /users - cpf duplicated", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Teste user 5",
      email: "test5@email.com",
      password: "test",
      cpf: "05533338012",
    })
    .then((response) => {
      expect(response.status).toBe(400);
    })
    .catch(fail);
});

test("get /users/aaaa - not found", () => {
  return request(address)
    .get(`${endpoint}/aaaa`)
    .then((response) => {
      expect(response.status).toBe(404);
    })
    .catch(fail);
});

test("patch /users/:id", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user 2",
      email: "test2@email.com",
      password: "test",
      cpf: "81363104080",
    })
    .then((response) => {
      request(address)
        .patch(`${endpoint}/${response.body._id}`)
        .send({ name: "Test user 2 - patch" })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body._id).toBeDefined();
          expect(response.body.name).toBe("Test user 2 - patch");
          expect(response.body.email).toBe("test2@email.com");
          expect(response.body.cpf).toBe("81363104080");
          expect(response.body.password).toBeUndefined();
        })
        .catch(fail);
    })
    .catch(fail);
});
