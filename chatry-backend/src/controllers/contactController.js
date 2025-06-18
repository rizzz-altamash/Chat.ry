// ===== src/controllers/contactController.js =====
const User = require('../models/User');

const syncContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body; // Array of {name, phoneNumber}
    const userId = req.user._id;
    
    // Normalize phone numbers
    const phoneNumbers = contacts.map(c => {
      let phone = c.phoneNumber.replace(/\D/g, ''); // Remove non-digits
      if (phone.length === 10) phone = '+91' + phone;
      if (!phone.startsWith('+')) phone = '+' + phone;
      return { ...c, normalizedPhone: phone };
    });
    
    // Find registered users
    const registeredUsers = await User.find({
      phone: { $in: phoneNumbers.map(p => p.normalizedPhone) },
      isPhoneVerified: true
    }).select('_id phone name username avatar status');
    
    // Create contact map
    const contactsToSave = [];
    const registeredContacts = [];
    
    for (const contact of phoneNumbers) {
      const registeredUser = registeredUsers.find(u => u.phone === contact.normalizedPhone);
      
      if (registeredUser && registeredUser._id.toString() !== userId.toString()) {
        contactsToSave.push({
          user: registeredUser._id,
          name: contact.name,
          addedAt: new Date()
        });
        
        registeredContacts.push({
          ...registeredUser.toObject(),
          savedName: contact.name
        });
      }
    }
    
    // Update user's contacts
    await User.findByIdAndUpdate(userId, {
      $set: { contacts: contactsToSave }
    });
    
    res.json({
      message: 'Contacts synced successfully',
      contacts: registeredContacts,
      totalSynced: phoneNumbers.length,
      foundRegistered: registeredContacts.length
    });
    
  } catch (error) {
    next(error);
  }
};

// Search users by username
const searchByUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    const userId = req.user._id;
    
    if (!username || username.length < 3) {
      return res.json({ users: [] });
    }
    
    const users = await User.find({
      username: { $regex: username, $options: 'i' },
      _id: { $ne: userId },
      isPhoneVerified: true
    })
    .select('name username avatar status')
    .limit(20);
    
    res.json({ users });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncContacts,
  searchByUsername
};