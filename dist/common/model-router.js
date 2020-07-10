"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRouter = void 0;
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 10;
        this.validateId = (req, resp, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError("Documento não encontrado"));
            }
            else {
                next();
            }
        };
        this.findAll = (req, resp, next) => {
            let page = parseInt(req.query._page || 1);
            page = page > 0 ? page : 1;
            if (req.query._limit) {
                this.pageSize = parseInt(req.query._limit || this.pageSize);
            }
            const skip = (page - 1) * this.pageSize;
            this.model
                .countDocuments({})
                .exec()
                .then((count) => this.model
                .find()
                .skip(skip)
                .limit(this.pageSize)
                .then(this.renderAll(resp, next, {
                page,
                count,
                pageSize: this.pageSize,
                url: req.url,
            })))
                .catch(next);
        };
        this.findById = (req, resp, next) => {
            this.prepareOne(this.model.findById(req.params.id))
                .then(this.render(resp, next))
                .catch(next);
        };
        this.save = (req, resp, next) => {
            let document = new this.model(req.body);
            document.save().then(this.render(resp, next)).catch(next);
        };
        this.replace = (req, resp, next) => {
            const options = { overwrite: true, runValidators: true };
            this.model
                .replaceOne({ _id: req.params.id }, req.body, options)
                .exec()
                .then((result) => {
                if (result.n) {
                    return this.prepareOne(this.model.findById(req.params.id)).exec();
                }
                else {
                    throw new restify_errors_1.NotFoundError("Documento não encontrado");
                }
            })
                .then(this.render(resp, next))
                .catch(next);
        };
        this.update = (req, resp, next) => {
            const options = { new: true, runValidators: true };
            this.prepareOne(this.model.findByIdAndUpdate(req.params.id, req.body, options))
                .then(this.render(resp, next))
                .catch((err) => next(new Error(err)));
        };
        this.delete = (req, resp, next) => {
            this.model
                .deleteOne({ _id: req.params.id })
                .exec()
                .then((cmdResult) => {
                if (cmdResult.deletedCount == 1) {
                    resp.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError("Documento não encontrado");
                }
                return next();
            })
                .catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    envelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    envelopeAll(documents, options = {}) {
        const resource = {
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
            }
            else {
                resource.next = false;
            }
        }
        return resource;
    }
    prepareOne(query) {
        return query;
    }
    prepareMany(query) {
        return query;
    }
}
exports.ModelRouter = ModelRouter;
//# sourceMappingURL=model-router.js.map