const { MongoClient } = require('mongodb');
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001;

// Your MongoDB details
const url = 'mongodb://localhost:27017';
const dbName = 'trainingappDB';
const collectionName = "trainings";

// Middleware to parse JSON requests & CORS
app.use(bodyParser.json());
app.use(cors());

app.get('/latest-trainings', async (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true, connectTimeoutMS: 5000 });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch the latest training record based on date and the first weight
        const latestTraining = await collection.find().sort({ date: -1 }).limit(1).toArray();
        const latestTrainingWithWeight = await collection.find({ weight: { $ne: null } }).sort({ date: -1 }).limit(1).toArray();

        // Extract the required data
        let date, weight;
        if (latestTraining.length > 0) {
            date = latestTraining[0].date;
            console.log("Latest training date:", date);
        }
        if (latestTrainingWithWeight.length > 0) {
            weight = latestTrainingWithWeight[0].weight;
            console.log("First training weight:", weight);
        }
        if (date || weight) {
            res.json({ success: true, date, weight });
        } else {
            res.json({ success: false, message: "No training data found" });
        };

    } catch (error) {
        console.error('Error fetching latest training data', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.close();
    }
});

app.get('/initial-trainings', async (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true, connectTimeoutMS: 5000 });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch the first training record
        const firstTraining = await collection.find().sort({ date: 1 }).limit(1).toArray();
        const firstTrainingWithWeight = await collection.find({ weight: { $ne: null } }).sort({ date: 1 }).limit(1).toArray();

        // Extract the required data
        let date, weight;
        if (firstTraining.length > 0) {
            date = firstTraining[0].date;
            console.log("First training date:", date);
        }
        if (firstTrainingWithWeight.length > 0) {
            weight = firstTrainingWithWeight[0].weight;
            console.log("First training weight:", weight);
        }
        if (date || weight) {
            res.json({ success: true, date, weight });
        } else {
            res.json({ success: false, message: "No training data found" });
        }

    } catch (error) {
        console.error('Error fetching initial training data', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.close();
    }
});


// Endpoint to handle data from frontend
app.post('/trainings', async (req, res) => {
    const { date, weight } = req.body;
    console.log("App Express inside");

    const client = new MongoClient(url, { useUnifiedTopology: true, connectTimeoutMS: 5000 });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Insert data into the collection
        const result = await collection.insertOne({ date, weight });
        res.json({
            success: true,
            insertedId: result.insertedId
        });
        console.log("Data add to DB");

    } catch (error) {
        console.error('Error inserting data into MongoDB', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

