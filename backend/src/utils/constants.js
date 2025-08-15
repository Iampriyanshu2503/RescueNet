module.exports = {
    JWT_EXPIRES_IN: '7d',
    BCRYPT_SALT_ROUNDS: 12,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    NOTIFICATION_TYPES: {
        NEW_LISTING: 'new_listing',
        CLAIM_REQUEST: 'claim_request',
        CLAIM_CONFIRMED: 'claim_confirmed',
        PICKUP_REMINDER: 'pickup_reminder',
        LISTING_EXPIRING: 'listing_expiring'
    },
    STATUS: {
        SUCCESS: 'success',
        ERROR: 'error',
        FAIL: 'fail'
    },
    ROLES: {
        DONOR: 'donor',
        RECIPIENT: 'recipient',
        ADMIN: 'admin'
    }
};