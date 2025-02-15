import express from 'express';
import authRouter, { main } from './authentication';

main();

const app = express();

app.use(express.json());

app.use("/auth", authRouter);

app.listen(3000);