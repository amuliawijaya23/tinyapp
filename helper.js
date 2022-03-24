const generateRandomString = function() {
  let randomChar = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase();
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }
  return output;
};

const verifyEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
};

const verifyUserID = (userID) => {
  for (let user in users) {
    if (users[user].id === userID) {
      return users[user].id;
    }
  }
  return false;
};

const validateURL = (url) => {
  const regex = /^((http|https|ftp):\/\/)/;
  let newURL = '';
  if (!regex.test(url)) {
    newURL = 'http://' + url;
  } else {
    newURL = url;
  }
  return newURL.trim();
};

module.exports = {
  generateRandomString,
  verifyEmail,
  verifyUserID,
  validateURL
}