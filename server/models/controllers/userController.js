const User = require('../User');

const DEFAULT_SETTINGS = {
    notifications: {
        orderUpdates: true,
        shippingUpdates: true,
        promotions: true,
        wishlistAlerts: true,
        priceDropAlerts: true
    },
    communication: {
        email: true,
        sms: false,
        whatsapp: false
    },
    shopping: {
        preferredPaymentMethod: 'COD',
        currency: 'INR',
        defaultAddressId: null
    }
};

const normalizeSettings = (settings = {}) => ({
    notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(settings.notifications || {})
    },
    communication: {
        ...DEFAULT_SETTINGS.communication,
        ...(settings.communication || {})
    },
    shopping: {
        ...DEFAULT_SETTINGS.shopping,
        ...(settings.shopping || {})
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(
            key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const { street, city, state, zipCode, country, isDefault } = req.body;

        // If this is default, remove default from other addresses
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses.push({
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || user.addresses.length === 0
        });

        const createdAddress = user.addresses[user.addresses.length - 1];
        if (createdAddress?.isDefault) {
            user.settings = normalizeSettings(user.settings);
            user.settings.shopping.defaultAddressId = createdAddress._id;
        }

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding address',
            error: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;

        // If this is default, remove default from other addresses
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zipCode = zipCode || address.zipCode;
        address.country = country || address.country;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        if (address.isDefault) {
            user.settings = normalizeSettings(user.settings);
            user.settings.shopping.defaultAddressId = address._id;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const isDefaultAddress = address.isDefault;

        address.deleteOne();

        user.settings = normalizeSettings(user.settings);

        if (isDefaultAddress) {
            if (user.addresses.length > 0) {
                user.addresses.forEach((addr, index) => {
                    addr.isDefault = index === 0;
                });
                user.settings.shopping.defaultAddressId = user.addresses[0]._id;
            } else {
                user.settings.shopping.defaultAddressId = null;
            }
        } else {
            const currentDefaultId = user.settings?.shopping?.defaultAddressId;
            if (currentDefaultId && currentDefaultId.toString() === req.params.addressId.toString()) {
                user.settings.shopping.defaultAddressId = null;
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error: error.message
        });
    }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Remove default from all addresses
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        // Set this address as default
        address.isDefault = true;
        user.settings = normalizeSettings(user.settings);
        user.settings.shopping.defaultAddressId = address._id;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Default address updated',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error setting default address',
            error: error.message
        });
    }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('settings addresses name email');

        const normalizedSettings = normalizeSettings(user?.settings || {});

        res.status(200).json({
            success: true,
            data: {
                settings: normalizedSettings,
                addresses: user?.addresses || [],
                user: {
                    name: user?.name,
                    email: user?.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const incomingSettings = req.body || {};
        const mergedSettings = {
            ...normalizeSettings(user.settings || {}),
            notifications: {
                ...normalizeSettings(user.settings || {}).notifications,
                ...(incomingSettings.notifications || {})
            },
            communication: {
                ...normalizeSettings(user.settings || {}).communication,
                ...(incomingSettings.communication || {})
            },
            shopping: {
                ...normalizeSettings(user.settings || {}).shopping,
                ...(incomingSettings.shopping || {})
            }
        };

        if (mergedSettings.shopping.defaultAddressId) {
            const addressExists = user.addresses.some(
                (address) => address._id.toString() === mergedSettings.shopping.defaultAddressId.toString()
            );

            if (!addressExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected default address is invalid'
                });
            }

            user.addresses.forEach((address) => {
                address.isDefault = address._id.toString() === mergedSettings.shopping.defaultAddressId.toString();
            });
        }

        user.settings = mergedSettings;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};
