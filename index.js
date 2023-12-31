const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 5g000
require('dotenv').config()
app.use(cors())    //middleware
app.use(bodyParser.json())  //middleware
//file upload
const fileUpload = require('express-fileupload');
app.use(express.static('doctors'));
app.use(fileUpload());
const MongoClient = require('mongodb').MongoClient;

const ObjectId = require('mongodb').ObjectId
 
const uri = 'mongodb+srv://amit:v1XhtgJ1gYftiRMD@cluster0.g3vr0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const serviceCollections = client.db("ngo").collection("serviceCollections");
    const BookCollections = client.db("ngo").collection("Books");
    const reviewCollections = client.db("ngo").collection("reviews");
    const adminCollections = client.db("ngo").collection("admins");


// Post api
    app.post('/addService', (req, res) => {
        const file = req.files.file  //file means => type=file => client site
        const price = req.body.price
        const title = req.body.title
        const description = req.body.description
        const filePath = `${__dirname}/doctors/${file.name}`
        file.mv(filePath, (err) => {
            if (err) {
                res.status(500).send({ msg: "failed to upload" });
            }
      
        });

        const newImg = file.data;
        
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollections.insertOne({ price, title, description, image })
            .then(result => {
                fs.rm(filePath, err => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ msg: "failed to upload" })
                    }
                    res.send(result.insertedCount > 0);



                })
            })
    })
//get service api
    app.get('/service', (req, res) => {
        
        serviceCollections.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
// delete service 
    app.delete('/delete/:id', (req, res) => {
        
        serviceCollections.deleteOne({
            _id: ObjectId(req.params.id)
            
        })
            .then((result) => {

                res.send(result.deletedCount > 0)
            })
    })

// get service api
    app.get('/service/:id', (req, res) => {
        serviceCollections.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })
// insert adsbooking api
    app.post('/addBooking', (req, res) => {    //for data create
        const book = req.body
        console.log(book);
        BookCollections.insertOne(book)
            .then(result => {

                console.log(result.insertedCount);

                res.send(result.insertedCount > 0)
            })
            .catch(err => console.log(err))
    })

    // delete api my order
    app.delete('/addBooking/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await BookCollections.deleteOne(query);
        res.json(result);
    })
// get api
    app.get('/getBooking', (req, res) => {
        BookCollections.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


// get bookcollection api
    app.get('/bookCollection', (req, res) => {
        console.log(req.query.email);
        BookCollections.find({ email: req.query.email })
            .toArray((err, items) => {

                res.send(items)
            })

    })
// post addReview api
    app.post('/addReview', (req, res) => {    //for data create
        const order = req.body

        reviewCollections.insertOne(order)
            .then(result => {

                // console.log(result.insertedCount);
                // console.log(result);
                res.send(result.insertedCount > 0)
            })
    })
// get AddReview
    app.get('/addReview', (req, res) => {    //for data create
        reviewCollections.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })

    //make admin
    app.post('/makeAdmin', (req, res) => {
        const user = req.body;

        adminCollections.insertOne(user)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollections.find({ email: email })
            .toArray((err, admins) => {
                // console.log("admin check", admins)
                res.send(admins.length > 0)
            })
    })



})


app.get('/', (req, res) => {
    res.send("Tourism server is Running");
})

app.listen(port, () => {
    console.log("Server is Running", port);
})