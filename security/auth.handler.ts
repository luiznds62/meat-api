import * as restify from "restify";
import { User } from "../users/users.model";
import { NotAuthorizedError } from "restify-errors";
import { environment } from "../common/environment";
import * as jwt from "jsonwebtoken";

export const authenticate: restify.RequestHandler = (req, resp, next) => {
  const { email, password } = req.body;
  User.findByEmail(email, "+password")
    .then((user) => {
      if (user && user.matches(password)) {
        console.log("auqi o disgraça");
        const token = jwt.sign(
          {
            sub: user.email,
            iss: "meat-api",
          },
          environment.security.apiSecret
        );
        resp.json({ name: user.name, email: user.email, accessToken: token });
        return next(false);
      } else {
        return next(new NotAuthorizedError("Credenciais inválidas"));
      }
    })
    .catch(next);
};
