const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;
const cors= require("cors");
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
// Connect to MongoDB
mongoose.connect('mongodb+srv://freezepix:freezepix@freezepix.mhc6ham.mongodb.net/crystal', { useNewUrlParser: true });

// Create a Mongoose model for your collection
const jsonDataModel = mongoose.model('JsonData', {
  fileName: String, // Add this field
  data: Object,
  shipUser:String,
  billToUser:String,
  Total:String,
  imagesprod:String
});

// Use the express-fileupload middleware to handle file uploads
app.use(fileUpload());

// Create a route to handle JSON file upload and data storage
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  const promises = [];

  // Iterate through the uploaded files
  for (const fileKey in req.files) {
    const file = req.files[fileKey];

    if (file.name.endsWith('.json')) {
      // Generate a unique name for the file based on its original name
      const uniqueFileName = `${file.name}`;

      // Read the JSON file
      const jsonData = JSON.parse(file.data.toString('utf8'));

      let totalPrice = 0;

      // Iterate through the items and accumulate the prices
      jsonData.orders[0].serviceOrders[0].items.forEach((item) => {
        const itemPrice = item.options[0].price;
        console.log(itemPrice)
        totalPrice += itemPrice;
      });
      
      // Output the total sum of prices
      console.log(`Total sum of prices: $${totalPrice.toFixed(2)}`);
     // const subtotal = jsonData.orders[0].serviceOrders[0].items[0].options[0].price;
      // Create a new document and save it to the collection
      const images="https://drive.google.com/drive/folders/1qIqgGPvv-wTjz9DStUVeVabJd__bVLwW"
      const newJsonData = new jsonDataModel({ 
        fileName: uniqueFileName, 
        data: jsonData,
        shipUser:jsonData.shipTo.firstName,
        billToUser:jsonData.billTo.firstName,
        //Total:totalPrice,
        imagesprod:images
   
      });
      //console.log(subtotal);

      promises.push(newJsonData.save());
    
    }
  }

  // Wait for all promises to resolve before sending the response
  Promise.all(promises)
    .then(results => {
      res.json({ success: true, message: `order  registered with success ${results.length} files.` });
      
    })
    .catch(error => {
      res.status(401).json({ success: false, message: 'order already registered' });
    });
});
app.get('/jsonData', async (req, res) => {
  try {
    // Use the Mongoose model to find all documents in the collection
    const jsonData = await jsonDataModel.find({}).exec();
    res.json({ success: true, data: jsonData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




 //colcul som of price

 // mlultiple factures 


