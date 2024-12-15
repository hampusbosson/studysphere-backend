import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'


const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);


app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!'); 
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});