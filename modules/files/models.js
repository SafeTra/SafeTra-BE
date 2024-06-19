const mongoose = require('mongoose');
const { FILE_TYPE } = require('./enums');

let fileSchema = new mongoose.Schema({
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
        type: String,
        default: null,
        required: false,
    },
    url: {
        type: String,
        default: null,
        required: false,
    },
    type: {
        type: String,
        enum: [FILE_TYPE.IMAGE, FILE_TYPE.VIDEO, FILE_TYPE.CSV],
        default: FILE_TYPE.IMAGE,
    },
    is_deleted: {
        type: Boolean,
        default: false,
        required: false,
    }
}, {
    timestamps: true,
});

const File = mongoose.model('File', fileSchema);

module.exports = {
    File,
}