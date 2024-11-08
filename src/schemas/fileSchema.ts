import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: String,
  path: String,
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

export default mongoose.model("File", fileSchema);
