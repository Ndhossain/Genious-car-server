const express = require('express');
const cors = require('cors');
const app = express();
const Port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cj5piaf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function run() {
    try {
        const services = client.db("geniusCar").collection("services");
        app.get('/services', async (req, res) => {
            const cursor = await services.find({}).toArray();
            res.send(cursor);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const cursor = await services.findOne(query);
            res.send(cursor);
        })
    } catch (err) {
        
    }
}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send("Server is running");
})

app.listen(Port, () => {
    console.log(`Server is running on port: ${Port}`);
})
