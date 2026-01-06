import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors({})); // permite que o frontend acesse o backend sem dar erro de CORS
app.use(express.json()); // permite que o frontend envie dados para o backend em formato JSON

app.use(routes);

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
