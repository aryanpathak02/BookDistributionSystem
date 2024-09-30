
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issueDate: { type: Date, default: Date.now },
    returnDate: Date
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
