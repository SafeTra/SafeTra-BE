// const Transaction = require("../models/transactionModel");
// const User = require("../models/userModel");
// const axios = require("axios");
// const asyncHandler = require("express-async-handler");
// const createConfig = require("../config/config");

// const createTransaction = asyncHandler(async (req, res) => {
//   const { buyer, seller, amount, description, cardDetails } = req.body;
//   try {
//     const sender = await User.findById(buyer);
//     const receiver = await User.findById(seller);
//     if (!sender || !receiver) {
//       return res.status(404).json({ error: "Sender or receiver not found" });
//     }

//     const authData = cardDetails;
//     const encryptionKey = crypto.randomBytes(32);
//     const iv = crypto.randomBytes(i6);
//     const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)
//     authData = cipher.update(JSON.stringify(authData), 'utf-8', 'hex');
//     authData += cipher.final('hex');
//     console.log('Encrypted DATA: ', authData);

//     // let data = {
//     //   buyer: sender.email,
//     //   seller: receiver.email,
//     //   amount: amount,
//     //   description: description,
//     //   cardDetails: authData,
//     // }
//     // let config = createConfig(
//     //   "post",
//     //   "https://qa.interswitchng.com/api/v3/purchases",
//     //   data,
//     // );
    
    

//     // async function makeRequest() {
//     //   try {
//     //     const response = await axios.request(config);
//     //     res.json(response.data);
//     //   } catch (error) {
//     //     console.log(error);
//     //     //console.log(error.response.data.errors);
//     //   }
//     // }
    
//     // makeRequest();

//     // const newTransaction = await Transaction.create({ buyer, seller, amount, description });

//     // res.json(newTransaction)

//   } catch (error) {
//     console.log("Error creating transaction:", error);
//     res.status(500).json({ error: "Failed to create transaction" });
//   }
// });

// // const getTransaction = asyncHandler(async (req, res) => {
// //   let config = createConfig(
// //     "get",
// //     "https://api.escrow.com/2017-09-01/transaction"
// //   );
// //   async function makeRequest() {
// //     try {
// //       const response = await axios.request(config);
// //       res.json(response.data);
// //     } catch (error) {
// //       console.log(error);
// //       //console.log(error.response.data.errors);
// //     }
// //   }
  
// //   makeRequest();
  
// // });

// // const acceptTransaction = asyncHandler(async (req, res) => {
// //   const id = req.params.id
// //   let data = req.body;
// //   try {
// //     const traId = await Transaction.findOne({id: id});
// //     if(!traId){
// //       throw new Error ('id not found')
// //     }
// //   } catch (error) {
// //     throw new Error (error)
// //   }
// //   let config = createConfig(
// //     "patch",
// //     `https://api.escrow.com/2017-09-01/transaction/${id}`,
// //     data,
// //   );
// //   async function makeRequest() {
// //     try {
// //       const response = await axios.request(config);
// //       res.json(response.data);
// //     } catch (error) {
// //       console.log(error);
// //       //console.log(error.response.data.errors);
// //     }
// //   }
  
// //   makeRequest();
  
// // });


// module.exports = {
//   createTransaction
// };
