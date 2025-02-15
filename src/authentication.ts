import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import { jwtkey, saltround } from "./config";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient()

export async function main(){
    await prisma.$connect();
    console.log("Database Connected!!")
}

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
    let password = req.body.password as string;
    try{
        password = await bcrypt.hash(password, saltround);
    }
    catch(e){
        console.log(e);
        res.json({
            message: "Some error occurred"
        }).status(500);
        return;
    }
    
    const userRes = await prisma.user.create({
        data: {
            fullname: req.body.fullname,
            email: req.body.email,
            password: password
        }
    })

    const token = jwt.sign({
        fullname: req.body.fullname,
        email: req.body.email
    }, jwtkey, {
        expiresIn: 3000
    });

    res.json({
        token
    })
});

authRouter.post("/login", async (req, res) => {
    const email = req.body.email as string;
    const password = req.body.password as string;

    const userRes = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if(!userRes){
        res.json({
            message: "Invalid Credential"
        }).status(403);
        return;
    }
    let isSame = await bcrypt.compare(password, userRes!.password); 
    if(!isSame){
        res.json({
            message: "Invalid Credential"
        }).status(403);
        return;
    }

    
    const token = jwt.sign({
        fullname: req.body.fullname,
        email: req.body.email
    }, jwtkey, {
        expiresIn: 3000
    });

    res.json({
        token
    });
});

export default authRouter;