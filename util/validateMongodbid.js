const mongoose = require ('mongoose');
const validateMongodbid = (id => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error ('this is not a valid token or not found!')
});

module.exports = {validateMongodbid}