import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from '../api/routes/user.route.js'; 
import authRouter from '../api/routes/auth.route.js';
import listingRouter from '../api/routes/listing.route.js';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});
// Connect to MongoDB and then start the server
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("App is listening on port 3000.");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
