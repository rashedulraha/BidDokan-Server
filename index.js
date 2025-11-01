const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

//  middle ware
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

const run = async () => {
  try {
    await client.connect();
    //! crete a data base and users data collection

    const bidDokanDb = client.db("bidDokanDb");
    const bidCollection = bidDokanDb.collection("bidCollection");

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
      const myCollection = bidCollection.find();
      const result = await myCollection.toArray();
      res.send(result);
    });

    // ! Delete
    app.delete("/products/:id", async (req, res) => {
      const params = req.params.id;
      const query = { _id: new ObjectId(params) };
      const result = await bidCollection.deleteOne(query);
      res.send(result);
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
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("server is running port number :", port);
});
