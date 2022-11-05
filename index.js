const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
        const orders = client.db("geniusCar").collection("orders");
        // sercice
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
        // orders
        app.post('/orders', async (req, res) => {
            const data = req.body;
            const result = await orders.insertOne(data)
            res.send(result);
        })
        app.get('/orders', async (req, res) => {
            let query = {};
            if(req.query) {
                query = req.query;
            };
            const result = await orders.find(query).toArray();
            res.send(result);
        })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query);
            res.send(result);
        })
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    isApprove: data,
                },
            };
            const result = await orders.updateOne(filter, updateDoc, options);
            res.send(result);
        })
    } catch (err) {
        console.log(err.message);
    }
}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send("Server is running");
})

app.listen(Port, () => {
    console.log(`Server is running on port: ${Port}`);
})
