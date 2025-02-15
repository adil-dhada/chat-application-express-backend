"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("./config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.$connect();
        console.log("Database Connected!!");
    });
}
const authRouter = (0, express_1.Router)();
authRouter.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let password = req.body.password;
    try {
        password = yield bcrypt_1.default.hash(password, config_1.saltround);
    }
    catch (e) {
        console.log(e);
        res.json({
            message: "Some error occurred"
        }).status(500);
        return;
    }
    const userRes = yield prisma.user.create({
        data: {
            fullname: req.body.fullname,
            email: req.body.email,
            password: password
        }
    });
    const token = jsonwebtoken_1.default.sign({
        fullname: req.body.fullname,
        email: req.body.email
    }, config_1.jwtkey, {
        expiresIn: 3000
    });
    res.json({
        token
    });
}));
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const userRes = yield prisma.user.findFirst({
        where: {
            email: email
        }
    });
    if (!userRes) {
        res.json({
            message: "Invalid Credential"
        }).status(403);
        return;
    }
    let isSame = yield bcrypt_1.default.compare(password, userRes.password);
    if (!isSame) {
        res.json({
            message: "Invalid Credential"
        }).status(403);
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        fullname: req.body.fullname,
        email: req.body.email
    }, config_1.jwtkey, {
        expiresIn: 3000
    });
    res.json({
        token
    });
}));
exports.default = authRouter;
