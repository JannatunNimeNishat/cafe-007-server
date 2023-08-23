const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
var jwt = require('jsonwebtoken');
// middle wares
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oth2isl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
   
    const menuCollection = client.db('cafe-077-db').collection('menu');

    app.post('/jwt', (req, res) => {
        const email = req.body;
        
        const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    
       
    
        res.send({ token });
    })

    // get all menu data by category
    app.get('/menu/:value', async(req,res) =>{
        const category = req.params.value;
        
        const menu = await menuCollection.find().toArray();
        const selectedMenu = menu.filter(item => item.category ===  category);

        res.send(selectedMenu);
    })


 // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('cafe-007 server is running');
})


app.listen(port, () => {
    console.log(`cafe 007 server running at port: ${port}`);
})


