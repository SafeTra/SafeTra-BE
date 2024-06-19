const TXN_STATUS =  {
    INITIATED: 'INITIATED',
    COMPLETED: 'COMPLETED',
    VERIFIED: 'VERIFIED',
    PENDING: 'PENDING',
    FAILED: 'FAILED'
}

const CURRENCY = {
    USD: 'USD',
    GBP: 'GBP',
    NGN: 'NGN'
}


const SHIPPING_FEE_TAX = {
    BUYER: 'BUYER',
    SELLER: 'SELLER',
}

const PROFILE = {
    BUYER: 'BUYER',
    SELLER: 'SELLER',
}

module.exports = {
    TXN_STATUS,
    CURRENCY,
    SHIPPING_FEE_TAX,
    PROFILE
}