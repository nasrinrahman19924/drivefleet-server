 const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI;




const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
   
    await client.connect();
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('DriveFleet Server Running')
})

app.listen(port, () => {
  console.log(`Server running on ${port}`)
})






// const uri = "mongodb+srv://DriveFleet:g9DB919igSNFpIDf@cluster0.igogrqk.mongodb.net/?appName=Cluster0";