const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
var jwt = require('jsonwebtoken');
// middle wares
app.use(cors());
app.use(express.json());



// verifyJWT
const verifyJWT = async (req, res, next) => {
  const access_token = req.body.access_token;
  // console.log('body',req.body);
  if (!access_token) {
    return res.status(401).send({ error: true, message: 'unauthorized access' })
  }
  const token = access_token.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      res.status(401).send({ error: true, message: 'unauthorized access token not match' });
    }
    req.decoded = decoded;
    // console.log(decoded);
    next();
  })
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const cartCollection = client.db('cafe-077-db').collection('cart');
    app.post('/jwt', (req, res) => {
      const email = req.body;

      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });



      res.send({ token });
    })

    // get all menu data by category
    app.get('/menu/:value', async (req, res) => {
      const category = req.params.value;

      const menu = await menuCollection.find().toArray();
      const selectedMenu = menu.filter(item => item.category === category);

      res.send(selectedMenu);
    })

    //get single menu item details
    app.get('/menu_item_details/:_id', async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) }

      const menuItemDetails = await menuCollection.findOne(query);

      res.send(menuItemDetails);

    })

    //add item to cart
    app.post('/add_to_cart/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      const decodedEmail = req.decoded.loggedUser.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'forbidden access' });
      }
      const item = req.body.addItem;
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });


    //get cart items
    app.post('/cartItems/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const decodedEmail = req?.decoded?.loggedUser?.email;
      // console.log(email, 'decoded_email:', decodedEmail);
      if (email !== decodedEmail) {
        return res.send({ error: true, message: 'forbidden access' });
      }

      const query = { email: decodedEmail }

      const result = await cartCollection.find(query).toArray();



      res.send(result);


    });

    // delete a cart Item
    app.delete('/delete_cart_item/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query);
      res.send(result);
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


