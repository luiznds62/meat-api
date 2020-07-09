import * as mongoose from "mongoose";
import { validateCPF, checkDuplicatedCPF } from "../common/validators";
import * as bcrypt from "bcrypt";
import { environment } from "../common/environment";
import { BadRequestError } from "restify-errors";

export interface User extends mongoose.Document {
  name: string;
  cpf: string;
  email: string;
  password: string;
  profiles: string[];
  matches(password: string): boolean;
  hasAny(...profiles: string[]): boolean;
}

export interface UserModel extends mongoose.Model<User> {
  findByEmail(email: string, projection?: string): Promise<User>;
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
  profiles: {
    type: [String],
    required: false,
  },
});

userSchema.methods.hasAny = function (...profiles: string[]): boolean {
  return profiles.some((profile) => this.profiles.indexOf(profile) != -1);
};

userSchema.methods.matches = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

userSchema.statics.findByEmail = function (email: string, projection: string) {
  return this.findOne({ email }, projection);
};

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
  return checkDuplicatedCPF(this.email, this.cpf)
    .then((result) => {
      if (!result) {
        next(new BadRequestError(`CPF: ${this.cpf} já cadastrado`));
      } else {
        if (!validateCPF(this.cpf)) {
          next(new BadRequestError(`CPF: ${this.cpf} inválido`));
        } else {
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

export const User = mongoose.model<User, UserModel>("User", userSchema);
