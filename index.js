const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.VITE_API_PAYMENT_SECRT);
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, Admin } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k4th77t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());

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
    // Connect the client to the server
    await client.connect();

    // All collections
    const mealsCollection = client.db("hostelDB").collection("meals");
    const reviewCollection = client.db("hostelDB").collection("reviews");
    const mealreviewCollection = client.db("hostelDB").collection("mealreview");
    const membershipCollection = client.db("hostelDB").collection("membership");
    const paymentCollection = client.db("hostelDB").collection("payment");
    const requestmealCollection = client.db("hostelDB").collection("requestmeal");
    const usersCollection = client.db("hostelDB").collection("users");
    const likeCollection = client.db("hostelDB").collection("Like");

    // POST SECTION
    //------------------------------------------------------------//

    // Create payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // save paymend data
    app.post("/payment", async (req, res) => {
      const allData = req.body;
      const result = await paymentCollection.insertOne(allData);
      res.send(result);
    });

    // Post meal reviews
    app.post("/mealreview", async (req, res) => {
      const feedback = req.body;
      const result = await mealreviewCollection.insertOne(feedback);
      res.send(result);
    });

    // post request meal
    app.post('/requestmeal',async(req,res)=>{
      const meal=req.body;
      const query={_id:meal._id}
      const exist =await requestmealCollection.findOne(query)
      if(exist){
        return res.send({message:'request already exist'})
      }

      const result=await requestmealCollection.insertOne(meal)
      res.send(result)
    })

    // user related api 
    app.post('/users',async(req,res)=>{
      const user=req.body
      const query={email:user.email}
      const exist= await usersCollection.findOne(query)
      if(exist){
        return res.send({message:'user already exist',insertedId:null})
        
      }
      const result=await usersCollection.insertOne(user)
      res.send(result)
    })
    

    ///ADMIN RELATED API-----------------------------//
    app.patch('/users/admin/:id',async(req,res)=>{
      const id =req.params.id
      const filter ={_id:new ObjectId(id)}
      const updateDoc={
        $set:{
          role:'admin'
        }
      }
      const result=await usersCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

  //  like 
app.patch('/like/:id', async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          email: data.email,
          mealid: data.mealid
        },
        $inc: {
          like: data.like // Increment the like field by the value provided in the request
        }
      };
      const options = { upsert: true }; // Create a new document if no documents match the filter
      const result = await likeCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });


    // GET SECTION
    //------------------------------------------------------------//


    // app.patch('/users/badge/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       badge: 'silver'
    //     }
    //   };
    //   const result = await usersCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });
    

    // get like 
    app.get('/like',async(req,res)=>{
      const result=await likeCollection.find().toArray()
      res.send(result)
    })
    // get admin 
    app.get('/users/admin/:email',async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      const result=await usersCollection.findOne(query)
      let admin=false
      if(result){
        admin=result?.role==='admin'
      }
      res.send({admin})
    })



    // Get membership
    app.get("/membership", async (req, res) => {
      const result = await membershipCollection.find().toArray();
      res.send(result);
    });

    // Get single member by id
    app.get("/membership/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await membershipCollection.findOne(query);
      res.send(result);
    });
    // get payment history
    app.get("/payment", async (req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    });
    // Get all meals
    app.get("/meals", async (req, res) => {
      const result = await mealsCollection.find().toArray();
      res.send(result);
    });

    // get requested meal 
    app.get('/requestedmeal',async(req,res)=>{
      const result=await requestmealCollection.find().toArray()
      res.send(result)
    })
   

    // Get meal by category
    app.get("/meals/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await mealsCollection.find(query).toArray();
      res.send(result);
    });

    // Get meals by id
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await mealsCollection.findOne(query);
      res.send(result);
    });

    // Get reviews/what our client says
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // get review by id
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    // Get all meal reviews
    app.get("/mealreview", async (req, res) => {
      const result = await mealreviewCollection.find().toArray();
      res.send(result);
    });

    // get single my review
    app.get("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await mealreviewCollection.findOne(query);
      res.send(result);
    });

    // Delete meal review
    app.delete("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await mealreviewCollection.deleteOne(query);
      res.send(result);
    });

    // delte requested meal 
    app.delete('/requestmeal/:id',async(req,res)=>{
      const id=req.params.id
      const result=await requestmealCollection.deleteOne({_id:new ObjectId(id)})
      res.send(result)
    })

    // get users
    app.get('/users',async (req,res)=>{
      const result=await usersCollection.find().toArray()
      res.send(result)

    }) 
    
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // Comment this out for now to keep the connection open for further requests
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hostel server is running");
});

app.listen(port, () => {
  console.log(`Hostel server is running on port: ${port}`);
});
