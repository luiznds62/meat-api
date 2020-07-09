import * as restify from "restify";
import { ForbiddenError } from "restify-errors";

export const authorize: (...profiles: string[]) => restify.RequestHandler = (
  ...profiles
) => {
  return (req, resp, next) => {
    if (
      req.authenticated != undefined &&
      req.authenticated.hasAny(...profiles)
    ) {
      req.log.debug(
        "Usuário %s foi autorizado com os perfis %j na rota %s. Perfil esperado: %j",
        req.authenticated._id,
        req.authenticated.profiles,
        req.path(),
        profiles
      );

      next();
    } else {
      if (req.authenticated) {
        req.log.debug(
          "Acesso negado para %s. Perfil esperado: %j. Perfil do usuário: %j",
          req.authenticated._id,
          profiles,
          req.authenticated.profiles
        );
      }
      next(new ForbiddenError("Acesso negado"));
    }
  };
};
