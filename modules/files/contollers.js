const { s3, BASE_FILE_URL } = require("../../config/awsConfig");
const { v4: uuidv4 } = require("uuid");
const { fileUploader, multipleUploader } = require("../../util/fileUploader");
const { FILE_TYPE } = require("./enums");
const { File } = require("./models");
const asyncHandler = require('express-async-handler');
const path = require("path");
const { ROLES } = require("../users/enums");
const { PAGE_LIMIT } = require("../../config/env");



const getFiles = asyncHandler(async (req, res) => {
    let { page } = req.query;

    const filters = {};
    if (!page) page = 1;
    page = Number(page);
    const skip = (page - 1) * PAGE_LIMIT;
    for (const queryValue of Object.keys(req.query)) {
        filters[queryValue] = req.query[queryValue]
    }

    try {
        const getFiles = await File.find({ 
            is_deleted: false,
            ...filters
        }, {}, { skip: skip, limit: PAGE_LIMIT });
        
        const totalCount = await File.find({ 
            is_deleted: false,
            ...filters,
        }).countDocuments();
    
        return res.status(200).json({ 
            status: 'Success',
            message: 'Files fetched successfully',
            count: getFiles.length,
            total_count:  totalCount,
            page: page,
            next: page + 1,
            data: getFiles,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error fetching files',
        });
    }
});




const uploadFile = asyncHandler(async (req, res) => {
    const { image_file, file_type } = req.files

    try {
        const newFileName = `${uuidv4()}__${(new Date).toISOString()}` + path.extname(image_file.name);
        
        const is_uploaded = fileUploader(image_file, newFileName)
        if (!is_uploaded) {
            return res.status(500).json({ 
                status: 'Failure',
                message: 'Error uploading file',
            });
        }

        const newFile = await File.create({
            type: file_type,
            url:  BASE_FILE_URL + newFileName,
            name: newFileName,
            owner: req.user.id
        });
    
        
        console.log(`${newFile.name} created successfully`);    // For logs
        return res.status(200).json({ 
            status: 'Success',
            message: 'File created successfully',
            data: newFile,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error creating item',
        });
    }
});


const uploadMultipleFiles = asyncHandler(async (req, res) => {
    
    try {
        // Binary data base64
        
        console.log("Sending files")
        const uploadedfiles = []
        for (const item of Object.values(req.files)) {
            if (item.data) uploadedfiles.push(item)
        }

        const newUploadedFile = []
        for (const file of uploadedfiles) {
            const newFile = await File.create({
                owner: req.user_id,
                type: FILE_TYPE.IMAGE
            })

            newUploadedFile.push(newFile);
        }

        multipleUploader.array('items', newUploadedFile.length);

        // const newItem = await Item.create(
        //     req.body
        // ).populate("owner");
    
        // console.log(`${newItem._id} created successfully`);    // For logs
        return res.status(200).json({ 
            status: 'Success',
            // message: 'Items created successfully',
            // data: newItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error creating item',
        });
    }
});




const getFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const getFile = await File.findById(id).populate("owner");
        
        if (!getFile) {
                return res.status(404).json({ 
                status: 'Failure',
                message: 'File not found',
            });
        }
        
        if (getFile && getFile.is_deleted) {
                return res.status(403).json({ 
                status: 'Failure',
                message: 'File has been deleted',
            });
        }

        return res.status(200).json({ 
            status: 'Success',
            message: 'File fetched successfully',
            data: getFile,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error fetching file',
        });
    }
});


const updateFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const getFile = await File.findById(id).populate("owner");

        if (!getFile) {
                return res.status(404).json({ 
                status: 'Failure',
                message: 'File not found',
            });
        }
        
        if (getFile && getFile.is_deleted) {
                return res.status(403).json({ 
                status: 'Failure',
                message: 'File has been deleted',
            });
        }

        await File.findByIdAndUpdate(
            id,
            req.body,
            {new: true, runValidators: true}
        );
        
        const updatedFile = await File.findById(id).populate("owner");
        console.log(`${updatedFile._id} File updated successfully`);    // For logs
        return res.status(200).json({ 
            status: 'Success',
            message: 'File fetched successfully',
            data: updatedFile,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error fetching file',
        });
    }
});


const deleteFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const deletedFile = await File.findById(id).populate("owner");

        if (!deletedFile) {
                return res.status(404).json({ 
                status: 'Failure',
                message: 'File not found',
            });
        }
        
        if (deletedFile && deletedFile.is_deleted) {
                return res.status(403).json({ 
                status: 'Failure',
                message: 'File has been deleted already',
            });
        }
        
        if (req.user.role !== ROLES.ADMIN && (deletedFile.owner._id !== req.user._id)) {
                return res.status(403).json({ 
                status: 'Failure',
                message: 'Unauthorized',
            });
        }

        deletedFile.is_deleted = true;
        deletedFile.save();

        console.log(`${deletedFile._id} File deleted successfully`);   // For logs
        return res.status(200).json({ 
            status: 'Success',
            message: 'File deleted successfully',
            data: deleteFile,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error deleting file',
        });
    }
});

module.exports = {
    getFiles,
    uploadFile,
    uploadMultipleFiles,
    getFile,
    updateFile,
    deleteFile
}