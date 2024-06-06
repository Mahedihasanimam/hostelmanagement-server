const express = require('express');
const app=express()
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const port=process.env.PORT || 5000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k4th77t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

app.use(express.json())
app.use(cors({
    origin:['http://localhost:5173'],
    credentials:true,
    optionsSuccessStatus:200
}))




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
    
    // all collection 

    const mealsCollection=client.db('hostelDB').collection('meals')
    const reviewCollection=client.db('hostelDB').collection('reviews')
    const mealreviewCollection=client.db('hostelDB').collection('mealreview')

// POST SECTION 
//------------------------------------------------------------//
// post meal reviews 
app.post('/mealreview',async(req,res)=>{
  const feedback=req.body
  const result=await mealreviewCollection.insertOne(feedback)
  res.send(result)
})





// GET SECTION 
//------------------------------------------------------------//
    // get all meals 
    app.get('/meals',async(req,res)=>{
        const result=await mealsCollection.find().toArray()
        res.send(result)
    })

    // get meals by id 
    app.get('/details/:id',async(req,res)=>{
        const id=req.params.id
        const query={_id: new ObjectId(id)}
        const result=await mealsCollection.findOne(query)
        res.send(result)
    })

    // get reviews/ what our client says
    app.get('/reviews',async(req,res)=>{
      const result = await reviewCollection.find().toArray()
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('hostel server is running')
})

app.listen(port,()=>{
    console.log(`hostel server is running on port:${port}`);
})