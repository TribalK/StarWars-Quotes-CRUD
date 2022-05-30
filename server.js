const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;

const Config = require('./public/Config');
let username = Config.USERNAME;
let password = Config.PASSWORD;

const PORT = process.env.PORT || 3000;
const connectionString = `mongodb+srv://${username}:${password}@cluster0.cfhfi.mongodb.net/?retryWrites=true&w=majority`;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('StarWars-Quotes')
    // Name collection of what we want to get
    const quotesCollection = db.collection('quotes');

    // Set view engine to ejs BEFORE any app.use, app.get, or app.post
    // This will allow us to generate HTML that contains the quotes by rendering the HTML.
    app.set('view engine', 'ejs');

    // Using the render method built into Express's response. It needs to follow this syntax:
    // res.render(view, locals);

    // Make sure you place body-parser before your CRUD handlers!
    app.use(express.json());
    app.use(express.urlencoded({ extended: true}));
    app.use(express.static('public'));

    /* * * * * * * * * * *
      APP FUNCTIONS
     * * * * * * * * * * */

    // CRUD :
      // Create (POST) - make something
      // Read (GET) - get something
      // Update (PUT) - change something
      // Delete (DELETE) - remove something

    // Server index file to the frontpage
    app.get("/", (req, res) => {
      const cursor = db.collection('quotes').find().toArray()
        .then(results => {
          // Put quotes to HTML using Embedded javascript (EJS)
          // Install npm install ejs --save
          res.render('index.ejs', {quotes : results});
        })
        .catch(error => {
          console.log(error);
        })
    });

    // Insert quote into database
    app.post("/quotes", (req, res) => {
      quotesCollection.insertOne(req.body)
      .then(result => {
        res.redirect('/');
      })
      .catch(error => {
        console.log(error);
      })
    });

    app.put('/quotes', (req,res) => {
      quotesCollection.findOneAndUpdate(
        { name: 'Chewbacca'},
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote
          }
        },
        {
          upsert: true
        }
      )
        .then(result => {
          res.json("Success");
        })
        .catch(error => {
          console.error(error);
        })
    })

    app.delete('/quotes', (req, res) => {
      quotesCollection.deleteOne(
        { name: req.body.name }
        )
        .then(result => {
          if (result.deletedCount === 0) {
            return res.json('No quote to delete')
          }
          res.json("Deleted Darth Vader quote");
        })
        .catch(error => {
          console.error(error);
        })
    })

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch(error => console.error(error))
