const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

//!  middle ware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://BidDokanDB:ajGXtiNnb0zsRJ2m@simpleproject.deo4wzy.mongodb.net/?appName=SimpleProject";

//! connect mongoDb client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ! run function
const run = async () => {
  try {
    await client.connect();
    //! crete a data base and users data collection

    const bidDokanDb = client.db("bidDokanDb");
    const bidCollection = bidDokanDb.collection("bidCollection");
    const bids = bidDokanDb.collection("bids");

    // ! Post
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await bidCollection.insertOne(newProduct);
      res.send(result);
    });

    // ! patch
    app.patch("/products/:id", async (req, res) => {
      const params = req.params.id;
      const updateProduct = req.body;
      const query = { _id: new ObjectId(params) };
      const update = {
        $set: {
          name: updateProduct.name,
          price: updateProduct.price,
        },
      };
      const option = {};
      const result = await bidCollection.updateOne(query, update, option);

      res.send(result);
    });

    // ! get
    app.get("/products", async (req, res) => {
      // const projectDetails = { title: 1, price_min: 1, image: 1, price_max: 1 };
      // const myCollection = bidCollection
      //   .find()
      //   .sort({ price_min: 1 })
      //   .skip(3)
      //   .limit(3)
      //   .project(projectDetails);
      // const result = await myCollection.toArray();
      // console.log(req.query);

      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const myCollection = bidCollection.find(query);
      const result = await myCollection.toArray();
      res.send(result);
    });

    // ! single get product
    app.get("/products/:id", async (req, res) => {
      const params = req.params.id;
      const query = { _id: new ObjectId(params) };
      const result = await bidCollection.findOne(query);
      res.send(result);
    });

    // ! Delete
    app.delete("/products/:id", async (req, res) => {
      const params = req.params.id;
      const query = { _id: new ObjectId(params) };
      const result = await bidCollection.deleteOne(query);
      res.send(result);
    });

    // !  bids related apis
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const queryEmail = {};
      console.log(email);

      if (email) {
        queryEmail.buyer_email = email;
      }

      const allBids = bids.find(queryEmail);
      const result = await allBids.toArray();
      res.send(result);
    });

    // ! bids post apis
    app.post("/bids", async (req, res) => {
      const bids = req.body;
      const result = await bids.insertOne(bids);
      res.send(result);
    });

    // !bids delete apis
    app.delete("/bids/:id", async (req, res) => {
      const params = req.params.id;
      const query = { _id: new ObjectId(params) };
      const result = await bids.deleteOne(query);
      res.send(result);
    });

    // ! single get bids  product

    app.get("/bids/:id", async (req, res) => {
      const params = req.params.id;
      const query = { _id: new ObjectId(params) };
      const result = bids.findOne(query);
      res.send(result);
    });

    app.get("/", (req, res) => {
      res.send("Hello world");
    });

    //? route close
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
};

run().catch(console.dir);

//! server path

app.listen(port, () => {
  console.log("server is running port number :", port);
});
