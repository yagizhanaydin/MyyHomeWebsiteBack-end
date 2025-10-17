import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';  
import authRoutes from './routes/authRoutes.js';
import ilanRoutes from './routes/ilanRoutes.js'; 
import path from 'path';
dotenv.config();
const app = express();
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
}));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use('/api', authRoutes);
app.use('/home',ilanRoutes)
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
