const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ugnln4i.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const ToysCollection = client.db("ToyCars").collection("allProducts");



    app.get("/toys", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const result = await ToysCollection.find()
        .sort({ quantity: 1 })
        .limit(limit)
        .toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToysCollection.findOne(query);
      res.send(result);
    });

    app.get("/toys/search/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await ToysCollection.find({
        name: { $regex: searchText, $options: "i" },
      }).toArray();
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      const toys = await ToysCollection.find({
        sellerEmail: req.params.email,
      }).toArray();

      const sortedToys = toys.sort((a, b) => {
        const priceA = parseInt(a.price, 10);
        const priceB = parseInt(b.price, 10);

        return priceA - priceB; // Sort in ascending order
      });

      res.send(sortedToys);
    });

    app.get("/topRated", async (req, res) => {
      const toys = await ToysCollection.find({
        $and: [{ rating: { $gte: "4.8" } }, { rating: { $lte: "5" } }],
      }).toArray();

      res.send(toys);
    });

    app.get("/latest", async (req, res) => {
      const toys = await ToysCollection.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .toArray();
      res.send(toys);
    });

    app.get("/superCar/:subcategory", async (req, res) => {
      const subcategory = req.params.subcategory;
      const toys = await ToysCollection.find({ subcategory }).toArray();
      res.send(toys);
    });

    app.get("/fireTruck/:subcategory", async (req, res) => {
      const subcategory = req.params.subcategory;
      const toys = await ToysCollection.find({ subcategory }).toArray();
      res.send(toys);
    });

    app.get("/policeCar/:subcategory", async (req, res) => {
      const subcategory = req.params.subcategory;
      const toys = await ToysCollection.find({ subcategory }).toArray();
      res.send(toys);
    });

    app.post("/addToys", async (req, res) => {
      const toy = req.body;
      toy.createdAt = new Date();
      console.log(toy);
      const result = await ToysCollection.insertOne(toy);
      res.send(result);
    });

    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await ToysCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: body.quantity,
          price: body.price,
          description: body.description,
        },
      };
      const result = await ToysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`ToyCarExpress is running on port: ${port}`);
});
