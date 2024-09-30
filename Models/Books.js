const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookSchema = new mongoose.Schema({
    bookName: { type: String, required: true },
    category: { type: String, required: true },
    rentPerDay: { type: Number, required: true },
    isIssued: { type: Boolean, default: false }
});

const Books = mongoose.model("Book", bookSchema);
module.exports = Books;
