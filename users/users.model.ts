import * as mongoose from "mongoose";
import { validateCPF, checkDuplicatedCPF } from "../common/validators";
import * as bcrypt from "bcrypt";
import { environment } from "../common/environment";

export interface User extends mongoose.Document {
  name: string;
  cpf: string;
  email: string;
  password: string;
}

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
});

const hashPassword = (obj, next) => {
  bcrypt
    .hash(obj.password, environment.security.saltRounds)
    .then((hash) => {
      obj.password = hash;
      next();
    })
    .catch(next);
};

const saveMiddleware = function (next) {
  const user: User = this;
  if (!user.isModified("password")) {
    next();
  } else {
    hashPassword(user, next);
  }
};

const updateMiddleware = function (next) {
  if (!this.getUpdate().password) {
    next();
  } else {
    hashPassword(this.getUpdate(), next);
  }
};

const validateMiddleware = function (next) {
  if (!checkDuplicatedCPF(this.email, this.cpf)) {
    next(new Error(`CPF: ${this.cpf} já cadastrado`));
  } else if (!validateCPF(this.cpf)) {
    next(new Error(`CPF: ${this.cpf} inválido`));
  } else {
    next();
  }
};

userSchema.pre("save", saveMiddleware);
userSchema.pre("findOneAndUpdate", updateMiddleware);
userSchema.pre("update", updateMiddleware);
userSchema.pre("validate", validateMiddleware);

export const User = mongoose.model<User>("User", userSchema);
