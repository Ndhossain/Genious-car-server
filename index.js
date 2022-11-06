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

function jwtVerifier(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).send({message: 'Unauthorized Access level 1'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(401).send({message: 'Unauthorized Access level 2'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const services = client.db("geniusCar").collection("services");
        const orders = client.db("geniusCar").collection("orders");

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'} )
            res.send({token});
        })

        // service
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
        app.get('/orders', jwtVerifier, async (req, res) => {
            if(req.decoded.uid !== req.query.uid) {
                res.status(403).send({message: 'unauthorized access level 3'})
            }
            let query = {};
            if(req.query) {
                query = req.query;
            };
            const result = await orders.find(query).toArray();
            res.send(result);
        })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
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
