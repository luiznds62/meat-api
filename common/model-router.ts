import { Router } from "./router";
import * as mongoose from "mongoose";
import { NotFoundError } from "restify-errors";

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
  basePath: string;
  pageSize: number = 10;

  constructor(protected model: mongoose.Model<D>) {
    super();
    this.basePath = `/${model.collection.name}`;
  }

  envelope(document: any): any {
    let resource = Object.assign({ _links: {} }, document.toJSON());
    resource._links.self = `${this.basePath}/${resource._id}`;
    return resource;
  }

  envelopeAll(documents: any[], options: any = {}): any {
    const resource: any = {
      _links: {
        self: `${options.url}`,
      },
      items: documents,
      size: options.count ? options.count : 0,
    };
    if (options.page && options.count && options.pageSize) {
      if (options.page > 1) {
        resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
      }
      const remaining = options.count - options.page * options.pageSize;
      if (remaining > 0) {
        resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
        resource.next = true;
      } else {
        resource.next = false;
      }
    }
    return resource;
  }

  protected prepareOne(
    query: mongoose.DocumentQuery<D, D>
  ): mongoose.DocumentQuery<D, D> {
    return query;
  }

  protected prepareMany(
    query: mongoose.DocumentQuery<D[], D>
  ): mongoose.DocumentQuery<D[], D> {
    return query;
  }

  validateId = (req, resp, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      next(new NotFoundError("Documento não encontrado"));
    } else {
      next();
    }
  };

  findAll = (req, resp, next) => {
    let page = parseInt(req.query._page || 1);
    page = page > 0 ? page : 1;

    if (req.query._limit) {
      this.pageSize = parseInt(req.query._limit || this.pageSize);
    }

    const skip = (page - 1) * this.pageSize;

    this.model
      .count({})
      .exec()
      .then((count) =>
        this.model
          .find()
          .skip(skip)
          .limit(this.pageSize)
          .then(
            this.renderAll(resp, next, {
              page,
              count,
              pageSize: this.pageSize,
              url: req.url,
            })
          )
      )
      .catch(next);
  };

  findById = (req, resp, next) => {
    this.prepareOne(this.model.findById(req.params.id))
      .then(this.render(resp, next))
      .catch(next);
  };

  save = (req, resp, next) => {
    let document = new this.model(req.body);
    document.save().then(this.render(resp, next)).catch(next);
  };

  replace = (req, resp, next) => {
    const options = { overwrite: true, runValidators: true };
    (<any>this.model)
      .update({ _id: req.params.id }, req.body, options)
      .exec()
      .then((result) => {
        if (result.n) {
          return this.prepareOne(this.model.findById(req.params.id)).exec();
        } else {
          throw new NotFoundError("Documento não encontrado");
        }
      })
      .then(this.render(resp, next))
      .catch(next);
  };

  update = (req, resp, next) => {
    const options = { new: true, runValidators: true };
    this.prepareOne(
      this.model.findByIdAndUpdate(req.params.id, req.body, options)
    )
      .then(this.render(resp, next))
      .catch(next);
  };

  delete = (req, resp, next) => {
    this.model
      .remove({ _id: req.params.id })
      .exec()
      .then((cmdResult: any) => {
        if (cmdResult.result.n) {
          resp.send(204);
        } else {
          throw new NotFoundError("Documento não encontrado");
        }
        return next();
      })
      .catch(next);
  };
}
