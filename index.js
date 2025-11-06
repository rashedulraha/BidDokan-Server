// ---------------------------
//  Import Dependencies
// ---------------------------
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

// ---------------------------
//  App Configuration
// ---------------------------
const app = express();
const port = process.env.PORT || 3000;

// ---------------------------
//  Middleware
// ---------------------------
app.use(cors());
app.use(express.json());

// ---------------------------
// 🌐 MongoDB Connection
// ---------------------------
const uri =
  "mongodb+srv://BidDokanDB:ajGXtiNnb0zsRJ2m@simpleproject.deo4wzy.mongodb.net/?appName=SimpleProject";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ---------------------------
//  Run Main Function
// ---------------------------
async function run() {
  try {
    await client.connect();

    // console.log(" MongoDB Connected Successfully");

    // Database & Collections
    const db = client.db("bidDokanDb");
    const productsCollection = db.collection("bidCollections");
    const bidsCollection = db.collection("bids");
    const createProductsCols = db.collection("create-products");

    // ---------------------------
    //  PRODUCT APIs
    // ---------------------------

    //  Add a new product
    app.post("/products", async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.status(201).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to add product" });
      }
    });

    //  Get all products
    app.get("/products", async (req, res) => {
      try {
        const products = await productsCollection.find().toArray();
        res.send(products);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch products" });
      }
    });

    //  Get latest 6 products
    app.get("/latest-products", async (req, res) => {
      try {
        const latest = await productsCollection
          .find()
          .sort({ _id: -1 })
          .limit(6)
          .toArray();
        res.send(latest);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch latest products" });
      }
    });

    //  Get single product by ID
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }

        res.send(product);
      } catch (err) {
        res.status(400).send({ message: "Invalid product ID" });
      }
    });

    // ---------------------------
    //  BID APIs
    // ---------------------------

    //  Get all bids or by buyer_email
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId };
      const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    //  Add a new bid
    app.post("/bids", async (req, res) => {
      try {
        const newBid = req.body;
        const result = await bidsCollection.insertOne(newBid);
        res.status(201).send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to add bid" });
      }
    });

    //! create  products api
    app.post("/create-products", async (req, res) => {
      console.log("create products clicked");
      const createProducts = req.body;
      const result = await createProductsCols.insertOne(createProducts);
      res.send(result);
    });

    //!  put api to update product
    app.put("/update-products/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const UpdateId = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };

      const result = await productsCollection.updateOne(UpdateId, update);
      res.send(result);
    });

    //  Delete a bid by ID
    app.delete("/bids/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await bidsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Bid not found" });
        }
        res.send(result);
      } catch (err) {
        res.status(400).send({ message: "Invalid bid ID" });
      }
    });
  } catch (err) {
    console.error(" MongoDB Connection Failed:", err);
  }
}

run().catch(console.error);

// ---------------------------
//  Server Listen
// ---------------------------
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
