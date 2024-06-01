const express = require('express');
const app=express()
const cors = require('cors');
const cookieParser = require('cookie-parser');
const port=process.env.PORT || 5000

app.use(express.json())
app.use(cors({
    origin:['http://localhost:5000'],
    credentials:true,
    optionsSuccessStatus:200
}))


app.get('/',(req,res)=>{
    res.send('hostel server is running')
})

app.listen(port,()=>{
    console.log(`hostel server is running on port:${port}`);
})