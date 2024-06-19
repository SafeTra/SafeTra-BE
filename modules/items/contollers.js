const { Item } = require("./models");
const asyncHandler = require('express-async-handler');



const getItems = asyncHandler(async (req, res) => {
    let { page } = req.params;
    const { 
        // Filter parameters
        category, 
        subcategory, 
        availability, 
        brand, 
        location, 
        condition, 
        ownerId 
    } = req.params;

    if (!page) page = 1;
    const skip = (page - 1) * PAGE_LIMIT;

    try {
        const getItems = await Item.find({ 
            is_deleted: false, 
            category: category, 
            sub_category: subcategory, 
            availability: availability, 
            location: location,
            condition: condition, 
            owner:  ownerId 
        }).populate("owner");
        
        
        const totalCount = await Item.find({ 
            is_deleted: false, 
            category: category, 
            sub_category: subcategory, 
            availability: availability, 
            location: location,
            condition: condition, 
            owner:  ownerId 
        }).populate("owner").countDocuments();
    
        return res.status(200).json({ 
            status: 'Success',
            message: 'Items fetched successfully',
            count: PAGE_LIMIT,
            total_count:  totalCount,
            page: page,
            next: page + 1,
            data: getItems,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error fetching items',
        });
    }
});




const createItem = asyncHandler(async (req, res) => {
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




const getItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const getItem = await Item.findById(id).populate("owner");
        
        if (!getItem) {
                console.log(error);
                return res.status(404).json({ 
                status: 'Failure',
                message: 'Item not found',
            });
        }
        
        if (getItem && getItem.is_deleted) {
                console.log(error);
                return res.status(403).json({ 
                status: 'Failure',
                message: 'Item has been deleted',
            });
        }

        return res.status(200).json({ 
            status: 'Success',
            message: 'Item fetched successfully',
            data: getItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error fetching item',
        });
    }
});


const updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const getItem = await Item.findById(id).populate("owner");

        if (!getItem) {
                console.log(error);
                return res.status(404).json({ 
                status: 'Failure',
                message: 'Item not found',
            });
        }
        
        if (getItem && getItem.is_deleted) {
                console.log(error);
                return res.status(403).json({ 
                status: 'Failure',
                message: 'Item has been deleted',
            });
        }

        await Item.findByIdAndUpdate(
            id,
            req.body,
            {new: true, runValidators: true}
        );
        
        const updatedItem = await Item.findById(id).populate("owner");
        console.log(`${updatedItem._id} item updated successfully`);    // For logs
        return res.status(200).json({ 
            status: 'Success',
            message: 'Item fetched successfully',
            data: updatedItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error fetching item',
        });
    }
});


const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const deletedItem = await Item.findById(id).populate("owner");

        if (!deletedItem) {
                console.log(error);
                return res.status(404).json({ 
                status: 'Failure',
                message: 'Item not found',
            });
        }
        
        if (deletedItem && deletedItem.is_deleted) {
                console.log(error);
                return res.status(403).json({ 
                status: 'Failure',
                message: 'Item has been deleted',
            });
        }

        deletedItem.is_deleted = false;
        deletedItem.save();

        console.log(`${deletedItem._id} item deleted successfully`);   // For logs
        return res.status(200).json({ 
            status: 'Success',
            message: 'Item deleted successfully',
            data: deleteItem,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            status: 'Failure',
            message: 'Error deleting item',
        });
    }
});

module.exports = {
    getItems,
    createItem,
    getItem,
    updateItem,
    deleteItem
}