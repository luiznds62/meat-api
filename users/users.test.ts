import "jest";
import * as request from "supertest";

const endpoint = "/users";
let address: string = (<any>global).address;

/* Buscar todos os usuários */
test("get /users", () => {
  return request(address)
    .get(endpoint)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    })
    .catch(fail);
});

/* Buscar todos os usuários com filtro de email inexistente */
test("get /users - not found email", () => {
  return request(address)
    .get(`${endpoint}?email=emailinexistente@hotmail.com`)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items).toHaveLength(0);
    })
    .catch(fail);
});

/* Cria usuário e depois busca todos os usuários com filtro de email */
test("get /users - email filter", async () => {
  await request(address).post(endpoint).send({
    name: "Test user email filter",
    email: "testemail@email.com",
    gender: "Male",
    password: "test",
    cpf: "87997707093",
  });

  return request(address)
    .get(`${endpoint}?email=testemail@email.com`)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items).toHaveLength(1);
    })
    .catch(fail);
});

/* Criar usuário */
test("post /users", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user",
      email: "test@email.com",
      gender: "Male",
      password: "test",
      cpf: "05533338012",
    })
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe("Test user");
      expect(response.body.gender).toBe("Male");
      expect(response.body.email).toBe("test@email.com");
      expect(response.body.cpf).toBe("05533338012");
      expect(response.body.password).toBeUndefined();
    })
    .catch(fail);
});

/* Erro de email inválido */
test("post /users - email invalid", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user",
      email: "emailerror",
      gender: "Male",
      password: "test",
      cpf: "32289607061",
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("email");
    })
    .catch(fail);
});

/* Erro de gênero inválido */
test("post /users - gender invalid", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user",
      email: "emailerror",
      gender: "Masculino",
      password: "test",
      cpf: "32289607061",
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("gender");
    })
    .catch(fail);
});

/* Nome com tamanho mínimo inválido */
test("post /users - name min length", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Te",
      email: "test3@email.com",
      gender: "Male",
      password: "test",
      cpf: "82358826049",
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("name");
    })
    .catch(fail);
});

/* Nome com tamanho máximo inválido */
test("post /users - name max length", () => {
  return request(address)
    .post(endpoint)
    .send({
      name:
        "Tessssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssste",
      email: "test3@email.com",
      gender: "Male",
      password: "test",
      cpf: "82358826049",
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("name");
    })
    .catch(fail);
});

/* Cpf inválido */
test("post /users - cpf invalid", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Teste user",
      email: "test4@email.com",
      gender: "Male",
      password: "test",
      cpf: "1234",
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("CPF: 1234 inválido");
    })
    .catch(fail);
});

/* Cpf duplicado */
test("post /users - cpf duplicated", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Teste user 5",
      email: "test5@email.com",
      gender: "Male",
      password: "test",
      cpf: "05533338012",
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("CPF: 05533338012 já cadastrado");
    })
    .catch(fail);
});

/* Cria usuário e buscar por ID */
test("get /users/:id", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user x",
      email: "testx@email.com",
      gender: "Male",
      password: "test",
      cpf: "88739468011",
    })
    .then((response) => {
      request(address)
        .get(`${endpoint}/${response.body._id}`)
        .then((response) => {
          expect(response.status).toBe(200);
        })
        .catch(fail);
    })
    .catch(fail);
});

/* Buscar por ID inválido e inexistente */
test("get /users/aaaa - not found", () => {
  return request(address)
    .get(`${endpoint}/aaaa`)
    .then((response) => {
      expect(response.status).toBe(404);
    })
    .catch(fail);
});

/* Atualizar propriedade */
test("patch /users/:id", () => {
  return request(address)
    .post(endpoint)
    .send({
      name: "Test user 2",
      email: "test2@email.com",
      gender: "Male",
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
          expect(response.body.gender).toBe("Male");
          expect(response.body.email).toBe("test2@email.com");
          expect(response.body.cpf).toBe("81363104080");
          expect(response.body.password).toBeUndefined();
        })
        .catch(fail);
    })
    .catch(fail);
});

/* Cria usuário e deleta após */
test("delete /users/:id", async () => {
  let user = await request(address).post(endpoint).send({
    name: "Test user 6",
    email: "test6@email.com",
    gender: "Male",
    password: "test",
    cpf: "11946873004",
  });

  return request(address)
    .delete(`${endpoint}/${user.body._id}`)
    .then((response) => {
      expect(response.status).toBe(204);
    })
    .catch(fail);
});

/* Delete com ID inválido ou inexistente */
test("delete /users/aaaa - not found", () => {
  return request(address)
    .delete(`${endpoint}/aaaa`)
    .then((response) => {
      expect(response.status).toBe(404);
    })
    .catch(fail);
});

/* Atualiza usuário */
test("put /user/:id", async () => {
  let user = await request(address).post(endpoint).send({
    name: "Test user y",
    email: "testy@email.com",
    gender: "Male",
    password: "test",
    cpf: "97687884027",
  });

  return request(address)
    .put(`${endpoint}/${user.body._id}`)
    .send({
      name: "Test user z",
      email: "testz@email.com",
      gender: "Female",
      password: "testz",
      cpf: "70572190085",
    })
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe("Test user z");
      expect(response.body.gender).toBe("Female");
      expect(response.body.email).toBe("testz@email.com");
      expect(response.body.cpf).toBe("70572190085");
      expect(response.body.password).toBeUndefined();
    })
    .catch(fail);
});

/* Atualiza usuário e verificar se o gênero ficou undefined */
test("put /user/:id - gender undefined", async () => {
  let user = await request(address).post(endpoint).send({
    name: "Test user betha",
    email: "testbetha@email.com",
    gender: "Female",
    password: "test",
    cpf: "88852509046",
  });

  return request(address)
    .put(`${endpoint}/${user.body._id}`)
    .send({
      name: "Test user alfa",
      email: "testbetha@email.com",
      password: "testz",
      cpf: "88852509046",
    })
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe("Test user alfa");
      expect(response.body.gender).toBeUndefined();
      expect(response.body.email).toBe("testbetha@email.com");
      expect(response.body.cpf).toBe("88852509046");
      expect(response.body.password).toBeUndefined();
    })
    .catch(fail);
});

/* Atualiza usuário e verificar se o gênero ficou undefined */
test("put /user/aaaa - not found", () => {
  return request(address)
    .put(`${endpoint}/aaaa`)
    .send({
      name: "Test user alfa",
      email: "testalfa@email.com",
      password: "testz",
      cpf: "88852509046",
    })
    .then((response) => {
      expect(response.status).toBe(404);
    })
    .catch(fail);
});
