import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';  
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
}));


app.use('/api', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
