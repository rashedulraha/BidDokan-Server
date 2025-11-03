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
    const bidCollection = bidDokanDb.collection("bidCollections");
    const bids = bidDokanDb.collection("bids");

    // ! Post
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await bidCollection.insertOne(newProduct);
      res.send(result);
    });

    //! latest products
    app.get("/latest-products", async (req, res) => {
      const findProducts = bidCollection.find();
      const result = await findProducts.toArray();
      res.send(result);
    });

    //!  get products find single id
    app.get("/products/:id", async (req, res) => {
      try {
        const paramsID = req.params.id;
        const query = { _id: new ObjectId(paramsID) };
        const result = await bidCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Product not found" });
        }

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
      }
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
  } finally {
    // await client.close();
  }
};

run().catch(console.dir);

//! server path

app.listen(port, () => {
  console.log("server is running port number :", port);
});
