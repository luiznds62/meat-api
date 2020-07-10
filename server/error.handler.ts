import * as restify from "restify";

export function handleError(
  req: restify.Request,
  resp: restify.Response,
  err,
  cb
) {
  let handledError = undefined;

  switch (err.name) {
    case "MongoError":
      if (err.code === 11000) {
        err.handled = true;
        err.statusCode = 400;
        handledError = {
          message: `Valor ${err.errmsg.split('"')[1]} duplicado`,
        };
      }

      break;
    case "ValidationError":
      err.statusCode = 400;
      const messages: any[] = [];
      for (let name in err.errors) {
        let error = err.errors[name].properties;
        switch (error.type) {
          case "required":
            messages.push({
              message: `Não foi informado valor para o campo: ${error.path}`,
            });
            break;
          case "minlength":
            messages.push({
              message: `O valor: '${error.value}' tem tamanho inválido para o campo '${error.path}', mínimo: ${error.minlength}`,
            });
            break;
          case "maxlength":
            messages.push({
              message: `O valor: '${error.value}' tem tamanho inválido para o campo '${error.path}', máximo: ${error.maxlength}`,
            });
            break;
          case "enum":
            messages.push({
              message: `O valor: '${error.value}' não é valido para o campo '${error.path}', permitidos: ${error.enumValues}`,
            });
            break;
          case "regexp":
            messages.push({
              message: `O valor: '${error.value}' é inválido para o campo '${error.path}', formato incorreto ou escrito errado`,
            });
            break;
          case "min":
            messages.push({
              message: `O valor: '${error.value}' é inválido para o campo '${error.path}', pois é menor que o mínimo permitido: ${error.min}`,
            });
            break;
          case "max":
            messages.push({
              message: `O valor: '${error.value}' é inválido para o campo '${error.path}', pois é maior que o máximo permitido: ${error.max}`,
            });
            break;
          default:
            messages.push({ message: error.message });
            break;
        }
      }
      handledError = {
        message: "Ocorreu um erro de validação",
        errors: messages,
      };
      break;
  }

  if (!handledError) {
    handledError = {
      message: err.message,
    };
  }
  resp.send(err.statusCode, handledError);
  return cb();
}
