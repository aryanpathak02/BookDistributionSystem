const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const Book = require("../Models/Books");
const Transaction = require("../Models/Transactions");
const wrapAsync = require('../Utils/wrapAsync');

router.get("/issue",wrapAsync(async (req,res)=>{
    const books = await Book.find();
    const users =  await User.find();
    // console.log(`${books},${users}`);
    res.render('./Transcation/issueBook',{books,users});
}));

router.post('/issue',wrapAsync( async (req, res) => {
    const { bookName, userId, issueDate } = req.body;
    const book = await Book.findOne({ bookName });
    if (!book || book.isIssued) return res.status(400).send('Book is unavailable.');

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found.');

    const transaction = new Transaction({
        book: book._id,
        user: user._id,
        issueDate: new Date(issueDate)
    });

    await transaction.save();

    book.isIssued = true;
    await book.save();

    res.send('Book issued successfully.');
}));

router.get('/return',wrapAsync(async(req,res)=>{
    const books = await Book.find();
    const users =  await User.find();
    // console.log(`${books},${users}`);
    res.render('./Transcation/returnBook',{books,users});
}));

router.post('/return',wrapAsync( async (req, res) => {
    const { bookName, userId, returnDate } = req.body;
    const book = await Book.findOne({ bookName });
    if (!book || !book.isIssued) return res.status(400).send('Book is not issued.');

    const transaction = await Transaction.findOne({
        book: book._id,
        user: userId,
        returnDate: null
    });
    if (!transaction) return res.status(400).send('Transaction not found.');

    const issueDate = transaction.issueDate;
    const daysIssued = (new Date(returnDate) - new Date(issueDate)) / (1000 * 3600 * 24);
    const totalRent = daysIssued * book.rentPerDay;

    transaction.returnDate = new Date(returnDate);
    transaction.totalRent = totalRent;
    await transaction.save();

    book.isIssued = false;
    await book.save();

    res.send(`Book returned. Total rent: $${totalRent}`);
}));

router.get("/book",async(req,res)=>{
    const books = await Book.find();
    res.render("./Transcation/bookAvailability",{bookName:0,books});
})

router.get('/books',wrapAsync( async (req, res) => {
    const { bookname } = req.query;
    // console.log('Received book name:', bookname); 

   
    if (!bookname) {
        console.log('No book name provided, rendering empty details.'); 
        return res.render('./Transcation/bookAvailability', { 
            bookName: null,
            totalCount: 0,
            currentlyIssuedTo: null,
            history: [] 
        });
    }

   
    const book = await Book.findOne({ bookName: bookname });
    // console.log('Found book:', book); 
    

    if (!book) {
        console.log('Book not found for name:', bookname);
        return res.status(404).render('error', { message: 'Book not found' });
    }


    const transactions = await Transaction.find({ book: book._id }).populate('user');
    // console.log('Transactions found:', transactions); 

    const currentTransaction = transactions.find(t => !t.returnDate);
    // console.log('Current transaction:', currentTransaction); 
    const books = await Book.find();
  
    res.render('./Transcation/bookAvailability', {
        books : books ,
        bookName: book.bookName,
        totalCount: transactions.length,
        currentlyIssuedTo: currentTransaction ? currentTransaction.user.username : "Not issued",
        history: transactions.map(t => t.user.username) 
    });
}));


router.get('/totalRentRenderPage',wrapAsync(async (req,res)=>{
    const books = await Book.find();
    res.render("./Transcation/rentCheckBook",{books , totalRent : 0});
}));

router.get('/totalRentCheck',wrapAsync(async (req, res) => {
    const { bookName } = req.query;
    // console.log(bookName);
    const books = await Book.find();

    const book = await Book.findOne({ bookName });  
    const transactions = await Transaction.find({ book: book._id });
    const totalRent = transactions.reduce((acc, t) => acc + t.totalRent, 0);
    // console.log(totalRent);
    res.render("./Transcation/rentCheckBook",{ books,totalRent });
}));

// 



router.get('/userRederPage',wrapAsync(async (req, res) => {
    const users = await User.find(); 
    res.render('./Transcation/selectUser', { users , books : 0 });
}));

router.get('/user',wrapAsync(async (req, res) => {
    const { userId } = req.query;
    const users = await User.find(); 


    if (!userId) {
        return res.render('userTransactions', {
            books: [],
            message: 'Please provide a user ID or name.'
        });
    }

    // Find the user by userId
    const user = await User.findOne({ _id: userId });
    if (!user) {
        return res.render('userTransactions', {
            books: [],
            message: 'User not found.'
        });
    }

    // Find transactions for the user and populate book details
    const transactions = await Transaction.find({ user: user._id }).populate('book');

    // Create an array of book names issued to the user
    const books = transactions.map(t => t.book.bookName);

    // Render the results
    res.render('./Transcation/selectUser', {users,
        books: books,
        message: books.length > 0 ? 'Books issued to ' + user.username : 'No books issued to this user.'
    });
}));


router.get('/date',(req,res)=>{
    res.render('./Transcation/dateTransactions',{transactions: false});
})

router.get('/date/check', async (req, res) => {
    const { startDate, endDate } = req.query;

    const transactions = await Transaction.find({
        issueDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('book user');

    // Render the EJS template and pass the transactions data
    res.render('./Transcation/dateTransactions', {
        transactions: transactions,
        startDate: startDate,
        endDate: endDate
    });
});



module.exports = router;
