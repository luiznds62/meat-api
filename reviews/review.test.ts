import "jest";
import * as request from "supertest";
import * as dateformat from "dateformat";

const restaurantEndpoint = "/restaurants";
const userEndpoint = "/users";
const endpoint = "/reviews";
let address: string = (<any>global).address;

/* Busca todos os reviews e espera array vazio */
test("get /reviews", () => {
  return request(address)
    .get(endpoint)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items).toHaveLength(0);
    })
    .catch(fail);
});

/* Cria um review */
test("post /reviews", async () => {
  let user = await request(address).post(userEndpoint).send({
    name: "Usuário review 1",
    email: "review1@email.com",
    gender: "Male",
    password: "test",
    cpf: "77657338008",
  });

  let restaurant = await request(address).post(restaurantEndpoint).send({
    name: "Restaurante review 1",
  });

  let now = new Date();
  return request(address)
    .post(endpoint)
    .send({
      date: dateformat(now, "yyyy-mm-ddTHH:MM:ss").replace("P", "T"),
      rating: 5,
      comments: "Comentário de teste",
      user: user.body._id,
      restaurant: restaurant.body._id,
    })
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.date).toBeDefined();
      expect(response.body.rating).toBe(5);
      expect(response.body.comments).toBe("Comentário de teste");
      expect(response.body.user).toBe(user.body._id);
      expect(response.body.restaurant).toBe(restaurant.body._id);
    })
    .catch(fail);
});
