const { File } = require("./models");



const getFiles = asyncHandler(async (req, res) => {
    let { page } = req.params;

    const { 
        // Filter parameters
        fileType, 
        ownerId 
    } = req.params;

    if (!page) page = 1;
    const skip = (page - 1) * PAGE_LIMIT;

    try {
        const getFiles = await File.find({ 
            is_deleted: false, 
            type:  fileType, 
            owner:  ownerId 
        }).populate("owner");
        
        
        const totalCount = await File.find({ 
            is_deleted: false,
            type:  fileType, 
            owner:  ownerId 
        }).populate("owner").countDocuments();
    
        return res.status(200).json({ 
            status: 'Success',
            message: 'Files fetched successfully',
            count: PAGE_LIMIT,
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
    try {
        const newItem = await Item.create(
            req.body
        ).populate("owner");
    
        console.log(`${newItem._id} created successfully`);    // For logs
        return res.status(200).json({ 
            status: 'Success',
            message: 'Items created successfully',
            data: newItem,
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
                console.log(error);
                return res.status(404).json({ 
                status: 'Failure',
                message: 'File not found',
            });
        }
        
        if (getFile && getFile.is_deleted) {
                console.log(error);
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
                console.log(error);
                return res.status(404).json({ 
                status: 'Failure',
                message: 'File not found',
            });
        }
        
        if (getFile && getFile.is_deleted) {
                console.log(error);
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
                console.log(error);
                return res.status(404).json({ 
                status: 'Failure',
                message: 'File not found',
            });
        }
        
        if (deletedFile && deletedFile.is_deleted) {
                console.log(error);
                return res.status(403).json({ 
                status: 'Failure',
                message: 'File has been deleted already',
            });
        }

        deletedFile.is_deleted = false;
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
    getFile,
    updateFile,
    deleteFile
}