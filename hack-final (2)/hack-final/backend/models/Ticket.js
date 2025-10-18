import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: "Open" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Ticket", ticketSchema);
