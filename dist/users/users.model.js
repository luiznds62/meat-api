"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose = require("mongoose");
const validators_1 = require("../common/validators");
const bcrypt = require("bcrypt");
const environment_1 = require("../common/environment");
const restify_errors_1 = require("restify-errors");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3,
    },
    cpf: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        required: true,
    },
    password: {
        type: String,
        select: false,
        required: true,
    },
    gender: {
        type: String,
        required: false,
        enum: ["Male", "Female"],
    },
    profiles: {
        type: [String],
        required: false,
    },
});
userSchema.methods.hasAny = function (...profiles) {
    return profiles.some((profile) => this.profiles.indexOf(profile) != -1);
};
userSchema.methods.matches = function (password) {
    console.log(password);
    console.log(this.password);
    return bcrypt.compareSync(password, this.password);
};
userSchema.statics.findByEmail = function (email, projection) {
    return this.findOne({ email }, projection);
};
const hashPassword = (obj, next) => {
    bcrypt
        .hash(obj.password, environment_1.environment.security.saltRounds)
        .then((hash) => {
        obj.password = hash;
        next();
    })
        .catch(next);
};
const saveMiddleware = function (next) {
    const user = this;
    if (!user.isModified("password")) {
        next();
    }
    else {
        hashPassword(user, next);
    }
};
const updateMiddleware = function (next) {
    if (!this.getUpdate().password) {
        next();
    }
    else {
        hashPassword(this.getUpdate(), next);
    }
};
const validateMiddleware = function (next) {
    return validators_1.checkDuplicatedCPF(this.email, this.cpf)
        .then((result) => {
        if (!result) {
            next(new restify_errors_1.BadRequestError(`CPF: ${this.cpf} já cadastrado`));
        }
        else {
            if (!validators_1.validateCPF(this.cpf)) {
                next(new restify_errors_1.BadRequestError(`CPF: ${this.cpf} inválido`));
            }
            else {
                next();
            }
        }
    })
        .catch((err) => {
        next(new Error(`Ocorreu um erro ao validar o CPF: ${err}`));
    });
};
userSchema.pre("validate", validateMiddleware);
userSchema.pre("save", saveMiddleware);
userSchema.pre("findOneAndUpdate", updateMiddleware);
userSchema.pre("update", updateMiddleware);
userSchema.pre("replaceOne", updateMiddleware);
exports.User = mongoose.model("User", userSchema);
//# sourceMappingURL=users.model.js.map