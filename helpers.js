const generateRandomString = function() {
  // random char Base36 [0-9][a-z] times two (lower & upper case), sliced decimal
  let randomChar = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase();
  let output = '';
  for (let i = 0; i < 6; i++) { // loop six times
    // 6 random char from the generated characters
    output += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }
  return output;
};

const getUserByEmail = (email, users) => {
  // iterate over users in database
  for (const user in users) {
    // if match return user id
    if (users[user].email === email) return users[user].id;
  }
  return undefined;
};

const verifyUserID = (userIdInput, users) => {

  // check if user id exist in database
  if (users[userIdInput]) {
    return users[userIdInput].id; // return user id value 
  } else {
    return undefined;
  }
};

const validateURL = (url) => {
  const regex = /^((http|https|ftp):\/\/)/; // form "( http || https || ftp )://"
  let newURL = '';
  if (!regex.test(url)) {
    // if form does not match add "http://" in front of url
    newURL = 'http://' + url;
  } else {
    newURL = url;
  }
  return newURL.trim();
};

module.exports = {
  generateRandomString,
  verifyUserID,
  validateURL,
  getUserByEmail
};