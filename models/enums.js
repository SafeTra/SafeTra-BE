const ROLES = {
    ADMIN: "admin",
    USER: "user"
};

const TRANSACTION_STATUS = {
    INITIATED: "initiated",
    COMPLETED: "completed",
    VERIFIED: "verified",
    PENDING: "pending",
}

const ID_TYPE = {
    BVN: 'BVN',
    NIN: 'NIN_V2',
    VOTER_ID: 'VOTER_ID',
    DRIVERS_LICENSE: 'DRIVERS_LICENSE',
}

module.exports = {
    ROLES,
    TRANSACTION_STATUS,
    ID_TYPE
}