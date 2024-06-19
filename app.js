require('dotenv').config();

const express = require('express');
const app = express()
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 3000 || process.env.PORT

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors())


const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.DATABASE_URL, { useUnifiedTopology: true });
 
app.post('/post', async (req, res) => {
  try {
    const { consent, user, data } = req.body;
    // Connect to the MongoDB Atlas cluster
    await client.connect();
    // Select the database
    const db = client.db(process.env.DATABASE_NAME);
    // Select the responses collection
    const responsesCollection = db.collection('responses');

    const respondent = await responsesCollection.findOne({ 'user.email': user.email });
    
    if (respondent) {
      return res.status(409).json({ message: 'This email is already associated with an respondent.' });
    }

    const newResponse = {
      _id: new ObjectId(),
      consent: consent,
      user: user,
      data: data,
    };

    // Insert the new response document
    const result = await responsesCollection.insertOne(newResponse);

    // console.log(result)

    res.status(200).json({ message: 'Thank you for completing the survey!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/groups', async (req, res) => {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const groupsCollection = await db.collection('groups').findOne({ _id: new ObjectId('667349dd024d34055410505b') });
    res.status(200).json({ groupsCollection });
})

http.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`)
})