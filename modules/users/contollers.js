const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { validateMongodbid } = require('../../util/validateMongodbid');
const { ROLES } = require('./enums');
const { User, Kyc, Profile } = require('./models');
const { pageRoutes } = require('../../lib/pageRoutes');
const { loadTemplate, sendEmail } = require('../../helpers/emailHelper');
const { EMAIL_VERIFICATION_MAIL, emailVerificationValues } = require('../../helpers/mail_templates/emailVerification');
const { ZEPTO_CREDENTIALS, FE_BASE_URL, PAGE_LIMIT } = require('../../config/env');
const { EMAIL_SUBJECTS } = require('../../helpers/enums');
const { verificationToken } = require('../../config/jwtToken');
const { header } = require('express-validator');


const getAllUsers = asyncHandler(async (req, res) => {
  let { page, search } = req.query;
  
  if (!page) page = 1;
  page = Number(page);
  const skip = (page - 1) * PAGE_LIMIT;
  if (!search) search = "";

  try {
    const getUsers = await User.find(
      {
        role: ROLES.USER, 
        is_active: true,
        firstname: { $regex:  search},
        lastname: { $regex:  search},
        email: { $regex:  search},
        username: { $regex:  search},
      }, 
      { password:false, otp:false },
      { skip: skip, limit: PAGE_LIMIT }
    ).populate("profile")
    .populate("kyc");
    
    const totalCount = await User.find(
      {role: ROLES.USER, is_active: true}, 
      { password:false, otp:false },
    ).populate("profile")
    .populate("kyc").countDocuments();
    
    return res.status(200).json({ 
      status: 'Success',
      message: 'Users fetched successfully',
      count: getUsers.length,
      total_count:  totalCount,
      page: page,
      next: page + 1,
      data: getUsers,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error fetching users',
    });
  }
});



const getAllAdmins = asyncHandler(async (req, res) => {
  let { page, search } = req.params;
  
  if (!page) page = 1;
  page = Number(page);
  const skip = (page - 1) * PAGE_LIMIT;
  if (!search) search = ""; 

  try {
    const getAdmins = await User.find(
      {
        role: ROLES.ADMIN, 
        is_active: true,
        firstname: { $regex:  search},
        lastname: { $regex:  search},
        email: { $regex:  search},
        username: { $regex:  search},
      }, 
      {password:false, otp:false},
      { skip: skip, limit: PAGE_LIMIT }
    ).populate("profile");
    
    const totalCount = await User.find(
      {role: ROLES.ADMIN, is_active: true}, 
      {password:false, otp:false}
    ).populate("profile").countDocuments();

    return res.status(200).json({ 
      status: 'Success',
      message: 'Admins fetched successfully',
      count: getAdmins.length,
      total_count:  totalCount,
      page: page,
      next: page + 1, 
      data: getAdmins,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error Fetching admins',
    });
  }
});


const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  
  try {
    // Check for uniqueness via Email and Username
    const findUserByEmail = await User.findOne({ email: email.toLowerCase() });
    const findUserByUsername = await User.findOne({ username: username.toLowerCase() });

    if (!findUserByEmail && !findUserByUsername) {
      const newUser = await User.create({   // New user
        username,
        email,
        password,
        role
      });

      const newUserProfile = await Profile.create({    // New profile for new user 
        user_id: newUser._id,
      })
      
      newUser.profile = newUserProfile._id;

      if (role === ROLES.USER ) {
        const newUserKyc = await Kyc.create({   // New Kyc for new user
          user_id: newUser._id,
          user_profile_id: newUserProfile._id,
        })
        newUser.kyc = newUserKyc._id;
      }

      newUser.save();

      if (role === ROLES.USER) {
        // Generating verification link
        const token = verificationToken(newUser._id, newUser.role, email)
        const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}?username=${username}&token=${token}`;
        
        // Gerating email 
        const templateValues = emailVerificationValues(verificationLink)
        const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);
        
        // Sending verification mail
        sendEmail(
          ZEPTO_CREDENTIALS.noReply,
          EMAIL_SUBJECTS.EMAIL_VERIFICATION,
          loadedTemplate,
          {
            email: email
          }
        );
      } 
      else if (role === ROLES.ADMIN) {
        // // Gerating email 
        // const templateValues = emailVerificationValues(verificationLink)
        // const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);
        
        // // Sending verification mail
        // sendEmail(
        //   ZEPTO_CREDENTIALS.noReply,
        //   EMAIL_SUBJECTS.EMAIL_VERIFICATION,
        //   loadedTemplate,
        //   {
        //     email: email
        //   }
        // );
      }    

      const newUserData = await User.findById(
        newUser._id,
        {password: false}
      ).populate("profile").select("-password");

      const onboardingStatus = await newUserData.kyc_checker();
      console.log(`${username} created, verification link sent to ${email}`);  // For logs
      return res.status(201).json({ 
        status: "Success",
        message: 'User created Successfully, verification link sent!',
        data: newUserData,
        kyc_completed: onboardingStatus,
      });

    } else if (findUserByEmail) {
      console.log(`${email} already exists`);   // For logs
      return res.status(409).json({ 
        status: "Failure",
        error: 'Email already exists!' 
      });
    } else if (findUserByUsername) {
      console.log(`${username} already exists`);   // For logs
      return res.status(409).json({ 
        status: "Failure",
        error: 'Username already exists!' 
      });
    }
  } catch (error) {
    console.log(error);
    console.log(`Error creating user ${username}`);   // For logs
    res.status(500).json({
      status: 'Failure', 
      error: 'Error creating user'
    });
  }
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getSingleUser = await User.findById(
      id,
      {password:false, otp:false},
    ).populate("profile").populate("kyc");

    if (!getSingleUser || getSingleUser.role === ROLES.ADMIN ) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'User not found',
      });
    }else if (getSingleUser && !getSingleUser.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'User deactivated',
      });
    }

    const onboardingStatus = await getSingleUser.kyc_checker();
    
    return res.status(200).json({ 
      status: 'Success',
      message: 'User details fetched successfully', 
      data: getSingleUser,
      kyc_completed: onboardingStatus,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error Fetching user',
    });
  }
});


const getAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getSingleAdmin = await User.findById(
      id,
      {password:false, otp:false},
    ).populate("profile");

    if (!getSingleAdmin) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'Admin not found',
      });
    }else if (getSingleAdmin && !getSingleAdmin.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'Admin deactivated',
      });
    }else if (getSingleAdmin && getSingleAdmin.role === ROLES.USER) {
      return res.status(403).json({ 
        status: 'Failure',
        message: 'User acount detected',
      });
    }

    const onboardingStatus = await getSingleUser.kyc_checker();
    
    return res.status(200).json({ 
      status: 'Success',
      message: 'Admin details fetched successfully', 
      data: getSingleAdmin,
      kyc_completed: onboardingStatus,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error Fetching admin',
    });
  }
});



// To be used in place of deleting users
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbid(id);
    
    const deactivatedUser = await User.findById(
      id,
      {password:false, otp:false}
    ).populate("profile").populate("kyc");

    if (!deactivatedUser) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'User not found',
      });
    }else if (deactivatedUser && !deactivatedUser.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'User already deactivated',
      });
    }

    deactivatedUser.is_active = false;
    await deactivatedUser.save();
    
    const onboardingStatus = await deactivatedUser.kyc_checker();
    return res.status(200).json({ 
      status: 'Success',
      message: 'User deactivated successfully', 
      // data: deactivateUser,
      // kyc_completed: onboardingStatus,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error deactivating user',
    });;
  }
});


// To be used in place of deleting users
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbid(id);
    
    const activatedUser = await User.findById(
      id,
      {password:false, otp:false}
    ).populate("profile").populate("kyc");

    if (!activatedUser) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'User not found',
      });
    }else if (activatedUser && activatedUser.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'User is already activated',
      });
    }

    activatedUser.is_active = true;
    await activatedUser.save();
    
    const onboardingStatus = await activatedUser.kyc_checker();
    return res.status(200).json({ 
      status: 'Success',
      message: 'User activated successfully!', 
      data: activatedUser,
      kyc_completed: onboardingStatus,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error activating user',
    });;
  }
});


  

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, dob }  = req.body;
  try {
    validateMongodbid(id);

    const getSingleUser = await User.findById(
      id,
      {password:false, otp:false}
    ).populate("profile").populate("kyc");

    if (!getSingleUser) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'User not found',
      });
    }else if (getSingleUser && !getSingleUser.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'User deactivated',
      });
    }

    const getSingleUserProfile = await Profile.findOne({ user_id: id })
    const getSingleUserKyc = await Kyc.findOne({ user_id: id })
    
    // Verify username
    if (username) {
      var findUser = await User.findOne({ username: username.toLowerCase() });
      if (findUser && username.toLowerCase() === findUser.username) return res.status(409).json({ 
        status: 'Failure',
        message: 'Username already exists',
      })
    }

    // Verify email
    if (email) {
      findUser = await User.findOne({ email: email.toLowerCase() });
      if (findUser && email.toLowerCase() === findUser.email) return res.status(409).json({ 
        status: 'Failure',
        message: 'Email already exists',
      });
      else {
        getSingleUserKyc.is_email_verified = false;
        getSingleUserKyc.save();

        // Generating verification link
        const token = verificationToken(getSingleUser._id, getSingleUser.role, email)
        const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}?username=${username}&token=${token}`;
        
        // Gerating email 
        const templateValues = emailVerificationValues(verificationLink)
        const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);
        
        // Sending verification mail
        sendEmail(
          ZEPTO_CREDENTIALS.noReply,
          EMAIL_SUBJECTS.EMAIL_VERIFICATION,
          loadedTemplate,
          {
            email: email
          }
        );
      }
    }
    
    if (dob && getSingleUserKyc.is_id_verified) {
      delete req.body.dob;
    }

    // Todo: Verify mobile

    // Todo: Refactor to storing email before sending verification
    await User.findByIdAndUpdate(
      id,
      req.body,
      {new: true, runValidators: true}
    );

    await Profile.findByIdAndUpdate(
      getSingleUserProfile._id,
      req.body,
      {new: true, runValidators: true}
    );


    const updatedUser = await User.findById(
      id,
      {password:false, otp:false}
    ).populate("profile").populate("kyc");
    const onboardingStatus = await updatedUser.kyc_checker();
    return res.status(200).json({ 
      status: 'Success',
      message: 'User updated successfully', 
      data: updatedUser,
      kyc_completed: onboardingStatus,
    });
  } catch (error) {
    return res.status(404).json({
      status: 'Failure', 
      error: 'Error Updating user'
    }); 
  }
});

  

const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, dob }  = req.body;
  try {
    validateMongodbid(id);

    const getSingleAdmin = await User.findById(
      id,
      {password:false, otp:false}
    ).populate("profile").populate("kyc");

    if (!getSingleAdmin) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'User not found',
      });
    }else if (getSingleAdmin && !getSingleAdmin.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'User deactivated',
      });
    }

    const getSingleAdminProfile = await Profile.findOne({ user_id: id })
    const getSingleAdminKyc = await Kyc.findOne({ user_id: id })
    
    // Verify username
    if (username) {
      var findUser = await User.findOne({ username: username.toLowerCase() });
      console.log(findUser)
      if (findUser && username.toLowerCase() === findUser.username) return res.status(409).json({ 
        status: 'Failure',
        message: 'Username already exists',
      })
    }

    // Verify email
    if (email) {
      findUser = await User.findOne({ email: email.toLowerCase() });
      if (findUser && email.toLowerCase() === findUser.email) return res.status(409).json({ 
        status: 'Failure',
        message: 'Email already exists',
      });
      else {
        getSingleAdminKyc.is_email_verified = false;
        getSingleAdminKyc.save();

        // Generating verification link
        const token = verificationToken(getSingleAdmin._id, getSingleAdmin.role, email)
        const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}?username=${username}&token=${token}`;
        
        // Gerating email 
        const templateValues = emailVerificationValues(verificationLink)
        const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);
        
        // Sending verification mail
        sendEmail(
          ZEPTO_CREDENTIALS.noReply,
          EMAIL_SUBJECTS.EMAIL_VERIFICATION,
          loadedTemplate,
          {
            email: email
          }
        );
      }
    }
    
    if (dob && getSingleAdminKyc.is_id_verified) {
      delete req.body.dob;
    }

    // Todo: Verify mobile

    await User.findByIdAndUpdate(
      id,
      req.body,
      {new: true, runValidators: true}
    );

    await Profile.findByIdAndUpdate(
      getSingleAdminProfile._id,
      req.body,
      {new: true, runValidators: true}
    );


    const updatedAdmin = await User.findById(
      id,
      {password:false, otp:false}
    ).populate("profile").populate("kyc");
    const onboardingStatus = await updatedAdmin.kyc_checker();
    return res.status(200).json({ 
      status: 'Success',
      message: 'User updated successfully', 
      data: updatedAdmin,
      kyc_completed: onboardingStatus,
    });
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      status: 'Failure', 
      error: 'Error Updating user'
    }); 
  }
});

module.exports = {
  createUser,
  getAllUsers,
  getAllAdmins,
  getUser,
  getAdmin,
  deactivateUser,
  activateUser,
  updateUser,
  updateAdmin,
};