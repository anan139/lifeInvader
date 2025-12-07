import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import {inngest, functions} from './inngest/index.js'
import {serve} from 'inngest/express'
import {clerkMiddleware} from '@clerk/express'
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messegeRouter from './routes/messegeRoutes.js';

const app = express();
await connectDB();
app.use(express.json());
app.use(cors({
  origin: [
    'https://life-invader-rho.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(clerkMiddleware());
app.get('/', (req, res)=> res.send('server is running'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messegeRouter)

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`))

export default app;