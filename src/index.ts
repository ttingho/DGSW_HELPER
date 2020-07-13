import DotEnv from 'dotenv';
import express from 'express';
import apiRouter from './api';

DotEnv.config();

const app = express();

app.use('/api', apiRouter);

app.listen(3000, () => {
  console.log('3000port');
});
