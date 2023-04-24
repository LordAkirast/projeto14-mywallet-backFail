import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import Joi from 'joi';
import dayjs from 'dayjs';
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid"



///configs
dotenv.config();
const express = require('express');
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
        const { error } = loginSchema.validate({ email, senha });
      
        if (error) {
          const errorMessage = error.details.map((err) => err.message);
          return res.status(422).json({ error: errorMessage });
        }
      
        try {
          // Verifica se o usuário já existe no banco de dados
          const user = await db.collection("users").findOne({ email });
      
          if (user) {
            return res.sendStatus(409); // Email já cadastrado
          }
      
          // Se o usuário não existe, cria um novo usuário com a senha criptografada
          const hashedSenha = await bcrypt.hash(senha, 10); // 10 é o número de rounds de criptografia
          const newUser = {
            email,
            senha: hashedSenha, // salva a senha criptografada no banco de dados
          };
      
          await db.collection("users").insertOne(newUser);
      
          return res.sendStatus(201); // Usuário criado com sucesso
        } catch (error) {
          console.log(error);
          res.sendStatus(500);
        }
      });
      

      app.post("/", async (req, res) => {
        const { email, senha } = req.body;
        const { error } = loginSchema.validate({ email, senha });
          
        if (error) {
          const errorMessage = error.details.map((err) => err.message);
          return res.status(422).json({ error: errorMessage });
        }
          
        try {
          // Verifica se o usuário já existe no banco de dados
          const user = await db.collection("users").findOne({ email });
          
          if (!user) {
            console.log("email não encontrado");
            return res.sendStatus(404); // Email não encontrado
          }
          
          const senhaValida = await bcrypt.compare(senha, user.senha);
          
          if (!senhaValida) {
            console.log("senha incorreta");
            return res.sendStatus(401); // Senha incorreta
          }
          
          // Se o usuário existe e a senha está correta, retorna um token de autenticação
          // ...
      
          // Adiciona o token de autenticação ao localStorage
          const token = uuid()
          await db.collection("sessoes").insertOne({ token: user._id, idUsuario: user._id });
          res.send(token)
          localStorage.setItem("token", token);
          
          res.sendStatus(200);
        } catch (error) {
          console.log(error);
          res.sendStatus(500);
        }
      });



// Adicionar transações
app.post('/nova-transacao/:tipo', (req, res) => {
  const { tipo } = req.params;
  const { token, descricao, valor } = req.body;

  // Verificar se o token foi fornecido
  if (!token) {
    return res.status(401).send('Token de autorização não fornecido');
  }

  // Validar campos obrigatórios
  if (!descricao || !valor) {
    return res.status(422).send('Campos obrigatórios não fornecidos');
  }

  // Validar tipo de dado do valor
  if (typeof valor !== 'number' || valor <= 0) {
    return res.status(422).send('Valor deve ser um número positivo');
  }

  // Salvar transação no banco de dados
  const novaTransacao = {
    tipo,
    descricao,
    valor,
  };
  // Aqui você colocaria sua lógica de salvar no banco de dados ou na memória, dependendo da sua aplicação

  // Retornar resposta com status de sucesso
  return res.status(201).send('Transação adicionada com sucesso');
});

app.listen(5000, () => {
  console.log('Aplicação rodando na porta 3000');
});

      
      

    app.listen(5000, () => console.log("Servidor ligado na porta 5000"));

    