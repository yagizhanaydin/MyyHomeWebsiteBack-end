import pool from 'pool'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config();

export const GetAdminCompanyData=async(req,res)=>{

   const res = await pool.query('SELECT * FROM companies');
    
  
};

