import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY; 

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Access denied' });

    const token = authHeader.split(" ")[1]; 

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default verifyToken;



export const isAdmin = (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token yok" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Bu işlem sadece adminlere açık!" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Yetkisiz erişim!" });
  }
};
