import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'
import cookieParser from 'cookie-parser'

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!'); 
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});