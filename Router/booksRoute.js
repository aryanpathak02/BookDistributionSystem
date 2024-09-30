const express = require('express');
const router = express.Router();
const Book = require("../Models/Books");
const wrapAsync = require('../Utils/wrapAsync');


router.get("/searching",(req,res)=>{
   res.render("./Books/searchBooks",{ books: [] });
});

router.get('/search',wrapAsync( async (req, res) => {
    const term = req.query.name;
    console.log(term);
    const books = await Book.find({ bookName: new RegExp(term, 'i') });
    // console.log(books);
    res.render("./Books/searchBooks", {books});
}));

router.get("/range",(req,res)=>{
    res.render("./Books/rangeBooks",{ books: [] });
});

router.get('/rent',wrapAsync(async (req, res) => {
    const { min, max } = req.query;
    const books = await Book.find({
        rentPerDay: { $gte: min, $lte: max }
    });
    res.render("./Books/rangeBooks", {books});
}));

router.get('/filtersearch',(req,res)=>{
res.render('./Books/filterSearch',{books : []});
});

router.get('/filter',wrapAsync( async (req, res) => {
    const { category, name, min, max } = req.query;
    const books = await Book.find({
        category: category,
        bookName: new RegExp(name, 'i'),
        rentPerDay: { $gte: min, $lte: max }
    });
    res.render("./Books/filterSearch",{books})
}));


router.get('/books',wrapAsync( async (req, res) => {
    const books = await Book.find();
    res.render("./Books/showAllBooks",{books});
}));

module.exports = router;