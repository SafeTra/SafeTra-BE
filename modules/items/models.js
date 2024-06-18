const mongoose = require('mongoose');
const { CONDITION, AVAILABILITY, ITEM_CATEGORY } = require('./enums');
const { CURRENCY } = require('../transactions/enums');

let itemSchema = new mongoose.Schema({
    owner_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brand: {
      type: String,
      default: null,
      required: true,
    },
    description: {
      type: String,
      default: null,
      required: true,
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    }],
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: false
    },
    availability: {
        type: String,
        enum: [AVAILABILITY.OPEN, AVAILABILITY.SOLD, AVAILABILITY.CLOSED],
        default: AVAILABILITY.OPEN,
    },
    category: {
        type: String,
        enum: [
            ITEM_CATEGORY.PETS, 
            ITEM_CATEGORY.ELECTRONICS, 
            ITEM_CATEGORY.PHONES_TABLETS, 
            ITEM_CATEGORY.FUNITURE_APPLIANCES, 
            ITEM_CATEGORY.SPORTS_ARTS_OUTDOORS, 
            ITEM_CATEGORY.HEALTH_BEAUTY, 
            ITEM_CATEGORY.FASHION, 
            ITEM_CATEGORY.PROPERTY, 
            ITEM_CATEGORY.VEHICLES, 
            ITEM_CATEGORY.BABIES_KIDS, 
            ITEM_CATEGORY.AGRICULTURE_FOOD, 
            ITEM_CATEGORY.COMMERCIAL_EQUPMENT_TOOLS, 
            ITEM_CATEGORY.REPAIR_CONSTRUCTION
        ],
        required: true,
        default: ITEM_CATEGORY.PHONES_TABLETS,
    },
    // sub_category: {

    // }
    location: {
        type: String,
        default: null,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
        required: true,
    },
    currency: {
        type: String,
        enum: [CURRENCY.NGN, CURRENCY.USD, CURRENCY.GBP],
        default: CURRENCY.NGN,
    },
    condition: {
        type: String,
        enum: [CONDITION.BRAND_NEW, CONDITION.USED],
        default: CONDITION.USED,
    },
    opened_at: {
        type: String,
        default: ""
    },
    sold_at: {
        type: String,
        default: ""
    },
    closed_at: {
        type: String,
        default: ""
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
