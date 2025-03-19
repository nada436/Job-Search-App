import 'dotenv/config';
import cors from "cors";
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { database_connection } from './database/database_connection.js';
import { ADMIN_routes, user_routes } from './modules/User/User.controller.js';
import { chat_routes } from './modules/Chat/Chat.controller.js';
import { company_routes } from './modules/Company/Company.controller.js';
import { createHandler } from 'graphql-http/lib/use/express'
import { graphql_schema } from './modules/User/User.services.js';
import expressPlayground from 'graphql-playground-middleware-express';
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minutes
	limit: 30, // Limit each IP to 30 requests per minute.
	message:"Please wait and try again after 1 minute"
})
export const bootstrap=(app,express) => {
   app.use(cors())
   app.use(helmet())
   app.use(limiter)
  //database connection
   database_connection()
  //json
   app.use(express.json())

// Set up GraphQL API route 
app.use("/graphql", createHandler({ schema:graphql_schema }));
app.get('/playground', expressPlayground.default({ endpoint: '/graphql' }))
      
   //main router
    app.get('/', (req, res) => res.send('Welcome to the Job Search App'))

    //app routers
    app.use('/user',user_routes)
    app.use('/admin',ADMIN_routes)
    app.use('/company',company_routes)
    app.use('/chat',chat_routes)
  
    app.use("*",(req,res,next) => {
      next(new Error("page not found"))
})

    //global error_handeling
    app.use((error,req,res,next) => {
      return process.env.mode=="dev"? res.status('404').json({errormessage:error.message,stack:error.stack}):res.status('404').json({errormessage:error.message})
     })
      


    }

