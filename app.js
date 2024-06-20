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
    const groupsCollection = await db.collection('groups');

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
    // const result = await responsesCollection.insertOne(newResponse);
    // console.log(result)
    await responsesCollection.insertOne(newResponse);

    const groupField = data.group;  // data.group'dan gelen string
    const incrementValue = 1;       // Artış değeri (1)

    // Update groups
    await groupsCollection.updateOne(
      { _id: new ObjectId('667349dd024d34055410505b') },
      { $inc: { [groupField]: incrementValue } }
    );

    res.status(200).json({ message: 'Thank you for completing the survey!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/group', async (req, res) => {
  try{
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const groupsCollection = await db.collection('groups').findOne({ _id: new ObjectId('667349dd024d34055410505b') });

    // Exclude _id 
    const { _id, ...values } = groupsCollection;

    // To array
    const valueArray = Object.values(values);

    // Find min value
    const minValue = Math.min(...valueArray);

    // Find min value keys
    const keysWithMinValue = Object.keys(values).filter(key => values[key] === minValue);

    // Random
    const randomKey = keysWithMinValue[Math.floor(Math.random() * keysWithMinValue.length)];

    // console.log(randomKey, minValue);

    res.status(200).json({ data: randomKey });
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
})

http.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`)
})