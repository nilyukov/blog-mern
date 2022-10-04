import express from 'express';
import * as dotenv from 'dotenv'
import mongoose from 'mongoose';
import {registerValidation} from './validations/auth.js';
import checkAuth from "./utils/checkAuth.js";
import * as UserController from "./controllers/UserController.js";

dotenv.config();

mongoose
    .connect(`mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.lv7jwae.mongodb.net/blog?retryWrites=true&w=majority`)
    .then(() => console.log('DB ok'))
    .catch(err => console.log('DB error', err));

const app = express();

app.use(express.json());

app.post('/auth/login', UserController.login)

app.post('/auth/register', registerValidation, UserController.register);

app.get('/auth/me', checkAuth, UserController.getMe)

app.listen(process.env.PORT, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server OK');
});