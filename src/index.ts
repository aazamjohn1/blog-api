import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import { server } from "./app";
import { launchTelegramBot } from "./service/telegram.service";
const port = process.env.PORT! || 3001;

// Db connection
mongoose.connect(process.env.MONGODB_CONNECTION!).then(() => {
  console.log("mongoDB Connected successfully ✅", process.env.MONGODB_CONNECTION);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.table(listEndpoints(server));
    // Start Telegram bot
		launchTelegramBot()
  });
});