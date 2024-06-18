// const mongoose = require('mongoose');

// let itemSchema = new mongoose.Schema({
//     owner_id:{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     description: {
//       type: String,
//       default: null,
//       required: true,
//     },
//     images: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'File',
//     }],
//     video: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'File',
//         required: false
//     },
//     // availability: {

//     // }
//     // item_group: {

//     // }
//     // item_sub_group: {

//     // }
//     location: {
//         type: String,
//         default: null,
//         required: true,
//     },
//     price: {
//         type: Number,
//         default: 0,
//         required: true,
//     },
//     condition: {
//         type: String,
//         enum: [TXN_STATUS.INITIATED, TXN_STATUS.COMPLETED, TXN_STATUS.VERIFIED, TXN_STATUS.PENDING, TXN_STATUS.FAILED],
//         default: TXN_STATUS.INITIATED,
//     }
// }, {
//     timestamps: true,
// });
