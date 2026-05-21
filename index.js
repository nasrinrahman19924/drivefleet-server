const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb')



dotenv.config()


const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend-name.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken = (req, res, next) => {

  const token = req.cookies.token

  if (!token) {
    return res.status(401).send({
      message: 'Unauthorized Access'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err) {
      return res.status(401).send({
        message: 'Unauthorized Access'
      })
    }

    req.user = decoded

    next()
  })
};









async function run() {
  try {

  // await client.connect();


    const db = client.db("driveFleetDB");

    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("bookings");

  


     app.post('/jwt', async (req, res) => {

      const user = req.body

      const token = jwt.sign(
        user,
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax'
        })
        .send({ success: true })
    });

    app.post('/logout', async (req, res) => {

  res
    .clearCookie('token')
    .send({ success: true })

});

app.post('/cars', verifyToken, async (req, res) => {

  const carData = req.body

  const result = await carsCollection.insertOne(carData);

  res.send(result);

});

app.get("/cars", async (req, res) => {
  const search = req.query.search || "";

  const type = req.query.type || "";

  let query = {};

  if (search) {
    query.carName = {
      $regex: search,
      $options: "i",
    };
  }

  if (type) {
    query.type = type;
  }

  const result = await carsCollection
    .find(query)
    .toArray();

  res.send(result);
});


app.get('/cars/:id', async (req, res) => {

  const id = req.params.id

  const query = {
    _id: new ObjectId(id)
  }

  const result = await carsCollection.findOne(query)

  res.send(result)

});

app.get("/my-cars", async (req, res) => {
  const email = req.query.email;

  const result = await carsCollection
    .find({ ownerEmail: email })
    .toArray();

  res.send(result);
});


app.delete('/cars/:id', verifyToken, async (req, res) => {

  const id = req.params.id

  const query = {
    _id: new ObjectId(id)
  }

  const result = await carsCollection.deleteOne(query)

  res.send(result)

});

app.patch('/cars/:id', verifyToken, async (req, res) => {

  const id = req.params.id

  const updatedData = req.body

  const query = {
    _id: new ObjectId(id)
  }

  const updatedDoc = {
    $set: updatedData
  }

  const result = await carsCollection.updateOne(
    query,
    updatedDoc
  )

  res.send(result)

});

app.post('/bookings', verifyToken, async (req, res) => {

  const bookingData = req.body

  const result = await bookingsCollection.insertOne(bookingData)

  await carsCollection.updateOne(
  { _id: new ObjectId(bookingData.carId) },
  {
    $inc: {
      booking_count: 1
    }
  }
)

  res.send(result)

});

app.get('/bookings/:email', verifyToken, async (req, res) => {

  const email = req.params.email

  const query = {
    userEmail: email
  }

  const result = await bookingsCollection.find(query).toArray()

  res.send(result)

});
app.delete("/bookings/:id", async (req, res) => {

  const id = req.params.id;

  const result = await bookingsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});









    app.get('/', (req, res) => {
      res.send('DriveFleet Server Running')
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server running on ${port}`)
})






// const uri = "mongodb+srv://DriveFleet:g9DB919igSNFpIDf@cluster0.igogrqk.mongodb.net/?appName=Cluster0";