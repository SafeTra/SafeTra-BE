const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { validateMongodbid } = require('../../util/validateMongodbid');
const { ROLES } = require('./enums');
const { User } = require('./models');



const getAllUsers = asyncHandler(async (req, res) => {
    try {
      const getUsers = await User.find({role: ROLES.USER}, {password:false, otp:false});
      res.status(200).json(getUsers);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
});



const getAllAdmins = asyncHandler(async (req, res) => {
    try {
      const getAdmins = await User.find({role: ROLES.ADMIN}, {password:false, otp:false});
      res.status(200).json(getAdmins);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching admins' });
    }
});


const getaSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbid(id);
    try {
      const getaUser = await User.findById(id, {password:false, otp:false});
      res.json({
        getaUser,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching this user' });
    }
});



// To be used in place of deleting users
const deactivateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      validateMongodbid(id);
      const deactivatedUser = await User.findById(id);
      deactivatedUser.active = false;
      await deactivatedUser.save();
      res.json({
        deactivatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error deactivating this user' });
    }
});


  

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, mobile, address }  = req.body;
    try {
      validateMongodbid(id);
      const updatedUser = await User.findByIdAndUpdate(id,
        {
          username,
          address
        },
        {new: true, runValidators: true}
       );
      res.json({
        updateUser,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error updating this user' });
    }
});


// const updatePassword = asyncHandler(async (req, res) => {
//     const { id } = req.body;
//     const { password } = req.body;
  
//     try {
//       const user = await User.findById(id, {password:false, otp:false});
//       if (!user) {
//         console.log(`user <${id}> not found`)
//         return res.status(404).json({ 
//           status: 'Failure',
//           error: 'User not found' 
//         });
//       }
      
//       if (password) {
//         user.password = password;
//         const updatedPassword = await user.save();
//         console.log(`<${id}> password updated successfully!`)
//         return res.status(200).json({
//           status: 'Success',
//           message: 'Password updated successfully', 
//           data: user 
//         });
//       } else { 
//         console.log(`Password not provided for <${id}>`)
//         return res.status(400).json({ 
//           status: 'Failure',
//           error: 'Password not provided'
//         });
//       }
//     } catch (error) {
//       console.log(`<${id}> password update failed!`)
//       return res.status(500).json({
//         status: 'Failure', 
//         error: 'Error updating password' 
//       });
//     }
// });




// const deleteaUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   try {
//     validateMongodbid(id);
//     const deleteUser = await User.findByIdAndDelete(id);
//     res.json({
//       deleteUser,
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Error deleting this user' });
//   }
// });

module.exports = {
    updateUser,
    getAllUsers,
    getAllAdmins,
    getaSingleUser,
    // deleteaUser,
    deactivateUser,
    // updatePassword,
  };