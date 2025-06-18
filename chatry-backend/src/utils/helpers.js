// ===== src/utils/helpers.js =====
const formatDate = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInHours = (now - messageDate) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // 7 days
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  } else {
    return messageDate.toLocaleDateString();
  }
};

const sanitizePhoneNumber = (phone) => {
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '');
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  formatDate,
  sanitizePhoneNumber,
  generateOTP
};