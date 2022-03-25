const { assert } = require('chai');

const {
  generateRandomString, 
  verifyEmail, 
  verifyUserID, 
  validateURL,
  getUserByEmail
} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedUserID = "user2RandomID";
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined when given email does not exist', () => {
    const user = getUserByEmail("example@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});

describe('verifyUserID', () => {
  it('should return the userID of the account of the given username if it exist in the database', () => {
    const user = verifyUserID('user2RandomID', testUsers);
    const expectedUserID = 'user2RandomID';
    assert.strictEqual(user, expectedUserID);
  });

  it('should return false when no user with given email exist in the database', () => {
    const user = verifyUserID('user3RandomID', testUsers);
    const expectedUserID = false;
    assert.strictEqual(user, expectedUserID);
  });
});