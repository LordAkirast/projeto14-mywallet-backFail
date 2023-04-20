import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import Joi from 'joi';
import dayjs from 'dayjs';


///configs
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())


///schemas


///exemplo de joi
const messageSchema = Joi.object({

    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid("message", "private_message").required(),

})



////passwordjoi
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required().min(3)
})

  

///conectar com banco de dados
let db
const Mongoclient = new MongoClient(process.env.DATABASE_URL)
Mongoclient.connect()
    .then(() => db = Mongoclient.db())
    .catch((err) => console.log(err.message))


    app.post("/cadastro", async (req, res) => {
        const { email, senha } = req.body;
        const { error } = loginSchema.validate({ email, senha })
    
        if (error) {
            const errorMessage = error.details.map((err) => err.message);
            return res.status(422).json({ error: errorMessage });
        }
    
        try {
            const userExists = await db.collection("cadastro").findOne({ email })
    
            if (userExists) {
                return res.sendStatus(409)
            }
            return res.sendStatus(201)
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });

    app.listen(5000, () => console.log("Servidor ligado na porta 5000"));