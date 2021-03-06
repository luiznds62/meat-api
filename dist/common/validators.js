"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCPF = exports.checkDuplicatedCPF = void 0;
const users_model_1 = require("../users/users.model");
exports.checkDuplicatedCPF = (email, cpf) => {
    return users_model_1.User.findOne({ cpf: cpf })
        .then((user) => {
        if (user && user.email != email) {
            return false;
        }
        return true;
    })
        .catch((err) => {
        return false;
    });
};
exports.validateCPF = (cpf) => {
    let sum, rest;
    if (cpf == undefined || cpf.trim().length === 0 || cpf === "00000000000") {
        return false;
    }
    cpf = cpf.replace(".", "").replace(".", "").replace("-", "");
    sum = 0;
    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) {
        rest = 0;
    }
    if (rest !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) {
        rest = 0;
    }
    if (rest !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    return true;
};
//# sourceMappingURL=validators.js.map