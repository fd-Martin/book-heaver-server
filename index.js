const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pstqy5z.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("book_db");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments"); //

    app.get("/all-books", async (req, res) => {
      const cursor = booksCollection.find().sort({ rating: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/my-books", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/book-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-book", async (req, res) => {
      const newBook = req.body;
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    app.get("/latest-books", async (req, res) => {
      const cursor = booksCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const updateBook = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updateBook,
      };
      const result = await booksCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });

    //com
    app.get("/comments/:bookId", async (req, res) => {
      const bookId = req.params.bookId;
      const query = { bookId };
      const comments = await commentsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(comments);
    });

    app.post("/add-comment", async (req, res) => {
      const newComment = req.body;
      newComment.createdAt = new Date();

      const result = await commentsCollection.insertOne(newComment);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ++++++++++++++++++
app.get("/", (req, res) => {
  res.send("Smart server is running");
});

app.listen(port, (req, res) => {
  console.log(`Smart server is running on port: ${port}`);
});
