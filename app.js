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

app.get('/group', async (req, res) => {
    // - [ ] Connect database
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    // - [ ] Select collection
    // const responsesCollection = db.collection('responses');
    const responsesCollection = [
      {
        "consent": true,
        "user": {
          "name": "baran",
          "surname": "toro",
          "gender": "male",
          "email": "torobarn@gmail.com",
          "phone": "+49 174 883 13 37"
        },
        "data": {
          "group": "1",
          "productId": 1,
          "productName": "Lewis 501",
          "sustainable": false,
          "price": "700-750",
        }
      },
      {
        "consent": true,
        "user": {
          "name": "baran",
          "surname": "toro",
          "gender": "male",
          "email": "torobarn@gmail.com",
          "phone": "+49 174 883 13 37"
        },
        "data": {
          "group": "1",
          "productId": 1,
          "productName": "Lewis 501",
          "sustainable": false,
          "price": "700-750",
        }
      },
      {
        "consent": true,
        "user": {
          "name": "baran",
          "surname": "toro",
          "gender": "male",
          "email": "torobarn@gmail.com",
          "phone": "+49 174 883 13 37"
        },
        "data": {
          "group": "2",
          "productId": 1,
          "productName": "Lewis 501",
          "sustainable": false,
          "price": "700-750",
        }
      }
    ]
    // - [ ] Get number of respondents
    const totalResponse = responsesCollection.length
    // - [ ] Get number of each groups
    var group1 = []
    var group2 = []
    for (let index = 0; index < responsesCollection.length; index++) {
      const element = responsesCollection[index];
      element.data.group === '1' ? group1.push(element) : group2.push(element)
    }
    // - [ ] Get ID of the group with fewest respondents
    let id;
    console.log(group1)
    console.log('$$$$$$$$$')
    console.log(group2)
    group1.length>group2.length ? id = group2[0].data.group : group1[0].data.group
    // - [ ] Return ID
    res.status(200).json({ groupID: id });
})

http.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`)
})