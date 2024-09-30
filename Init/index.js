const sampleBooks = require("./data")
const Books = require("../Models/Books");
const mongoose = require('mongoose');

main()
.then(res=> console.log(`Connected succussfully`))
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Bookstore');
}

const insertData = async () =>{
    await Books.deleteMany({});
    await Books.insertMany(sampleBooks.data);
    console.log(`Data saved`);
}

insertData();