import  express  from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
// importing routes
import userRoutes from "./routes/user.js"
import budgetRoutes from "./routes/budget.routes.js"
import reminderRoutes from "./routes/reminder.routes.js"
import Transactionroutes from "./routes/Transaction.routes.js"
import reportRoutes from "./routes/report.routes.js"
import categoriesRoutes from "./routes/categories.routes.js"
import billSplitter from "./routes/BillSpiltter.routes.js"
import addnotes from "./routes/Addnotes.routes.js"
// middleware 
import ErrorMiddlewares from "./middlewares/Error.js"
const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


export default app

dotenv.config({
    path: "./config.env",
  });
  app.use(express.static('./uploads'))
  app.use('/user/profile', express.static('./uploads'))
  app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );
  app.use('',userRoutes);
  app.use('',budgetRoutes);
  app.use('',reminderRoutes);
  app.use('',Transactionroutes);
  app.use('',reportRoutes);
  app.use('',categoriesRoutes);
  app.use('',billSplitter);
  app.use('',addnotes);
  app.use(ErrorMiddlewares)