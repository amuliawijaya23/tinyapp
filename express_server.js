const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const PORT = 8080;
const {
  generateRandomString,
  verifyUserID,
  validateURL,
  getUserByEmail
} = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.set('view engine', 'ejs');
app.use(cookieSession({
  'name': 'session',
  'keys': ['secret', 'rahasia', 'key'],
  'maxAge': 12 * 60 * 60 * 1000 // set max cookie age to 12 hours
}));

const users = {
  'admin': {
    'id': 'admin',
    'email': 'admin@tinyapp.com',
    'password': '$2a$10$fVhgZ/scnablDOY9CAjOae6w/oWJTrp62/ZBAB.9C2f01qoQ.zjFS'
  },
  'jamesBly': {
    'id': 'jamesBly',
    'email': 'jamesbly@example.com',
    'password': '$2a$10$p2FCIn2WOwC9gnrGfHBj1uhdbYqICcFIPSdIPUvfiuNnWTeT5ZkvS'
  }
};


const urlDatabase = {
  "b2xVn2": {
    'userID': "admin",
    'longURL': "http://www.lighthouselabs.ca",
    'dateCreated': "3/21/2022",
    'visitors': {
      'admin': {'clicks': 1, 'lastClick': '3/22/2022'}
    },
    'clicks': 1
  },
  "9sm5xK": {
    'userID': "jamesBly",
    'longURL': "http://www.google.com",
    'dateCreated': "3/18/2022",
    'visitors': {
      'jamesBly': {'clicks': 1, 'lastClick': '3/20/2022'}
    },
    'clicks': 1
  }
};



// *** THIS SECTION IS FOR "GET" REQUESTS ***



app.get('/', (req, res) => {
  if (req.session.userID) {
    // redirect to myURLs for logged in user
    res.redirect('/urls');
  } else {
    // otherwise, redirect to sign in page
    res.redirect('/login');
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.session.userID
  };
  if (req.session.userID) {
    // redirect to myURLs page if logged in user attempt to register
    res.redirect('/urls');
  } else {
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.session.userID
  };
  if (req.session.userID) {
    // redirect to myURLs page if logged in user attempet to acces sign in page
    res.redirect('urls');
  } else {
    res.render('login', templateVars);
  }
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session.userID,
  };
  // template will show different page for non registered users
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session.userID
  };
  if (req.session.userID) { // check if user is logged in
    res.render("urls_new", templateVars);
  } else {
    // redirect if user is not logged in
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    username: req.session.userID
  };

  // check if user owns the url
  if (req.session.userID === urlDatabase[req.params.shortURL]['userID']) {
    res.render("urls_show", templateVars);
  } else {
    // deny access if user is not logged in or does not own the url
    res.statusMessage = 'Access Denied!';
    res.status(403).send(res.statusMessage);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = '';

  // check if short url exist in database
  if (urlDatabase[shortURL]) {

    // grabs long url if short url exist
    longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
    urlDatabase[shortURL]['clicks'] += 1; // add clicks by one

      if (!urlDatabase[shortURL]['visitors'][req.session.userID]) {
        // if user does not exist in the url's visitor database
        urlDatabase[shortURL]['visitors'][req.session.userID] = {
          'clicks': 1,
          'lastClick': new Date().toLocaleDateString()
        }
      } else {
        urlDatabase[shortURL][req.session.userID]['clicks'] += 1;
        urlDatabase[shortURL][req.session.userID]['lastClick'] = new Date().toLocaleDateString();
      }
  } else {
    // if provided short url does not exist
    res.redirect('/urls');
  }
});



// *** THIS SECTION IS FOR "POST" REQUESTS ***



app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  // check if user is logged in and owns the url
  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    
    if (urlDatabase[shortURL]) {
      urlDatabase[shortURL]['longURL'] = req.body.newURL; // set new url
      res.redirect(`/urls/${shortURL}`);
    }
  } else {
    // if user is not logged in or does not own the url
    res.statusMessage = 'Access Denied!';
    res.status(403).send(res.statusMessage);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // check if user is logged in
  if (req.session.userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    // Deny request if user is not logged in
    res.statusMessage = 'Access Denied!';
    res.status(403).send(res.statusMessage);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.userID) {
    // if user is logged in
    const shortURL = generateRandomString();
    let longURL = req.body.longURL;

    if (validator.isURL(longURL)) { // check if input is a URL
      
      // add http:// if input does not contain (http:// | https:// | ftp://)
      longURL = validateURL(longURL);
      
      // create new object to store the new url and tracking data
      urlDatabase[shortURL] = {
        'longURL': longURL,
        'userID': req.session.userID,
        'dateCreated': new Date().toLocaleDateString(),
        'visitors': {},
        'clicks': 0
      };
      // redirect to new url page
      res.redirect(`/urls/${shortURL}`);
    } else {
      // if provided url does not pass validator
      res.statusMessage = 'Invalid URL!';
      res.status(403).send(res.statusMessage);
    }
  } else {
    // if user is not logged in
    res.statusMessage = 'Access Denied!';
    res.status(403).send(res.statusMessage);
  }
});

app.post('/register', (req, res) => {
  const userID = req.body.userID;
  const email = req.body.email;
  const password = req.body.password;
  // hash the password with bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!userID || !email || !password) {
    // if either field in the form is empty
    res.statusMessage = 'Please fill in the form!';
    res.status(403).send(res.statusMessage);
  } else if (getUserByEmail(email, users) || verifyUserID(userID, users)) {
    // if provided email or user id already exist
    res.statusMessage = 'UserID or Email already exist!';
    res.status(403).send(res.statusMessage);
  } else {
    // create a new object with the given information to store in database
    users[userID] = {
      'id': userID,
      'email': email,
      'password': hashedPassword
    };
    // create an encrypted cookie session
    req.session.userID = userID;
    // logs the new object
    console.log(`registered new User:`, JSON.stringify(users[userID]));
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const usernameInput = req.body.username;
  const passwordInput = req.body.password;
  let userID = '';

  if (!getUserByEmail(usernameInput, users) && !verifyUserID(usernameInput, users)) {
    // if provided email or user id does not exist
    res.statusMessage = 'UserID or Email does not exist!';
    res.status(403).send(res.statusMessage);
  } else if (getUserByEmail(usernameInput, users)) {
    // grab user id if provided email exist in databse
    userID = getUserByEmail(usernameInput, users);
    if (bcrypt.compareSync(passwordInput, users[userID].password)) {
      // compares password provided matches with the hashed password in the database
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      res.statusMessage = 'UserID/Email and password does not match!';
      res.status(403).send(res.statusMessage);
    }
  } else if (verifyUserID(usernameInput, users)) {
    // if there's a matching user id in the database
    userID = usernameInput;
    if (bcrypt.compareSync(passwordInput, users[userID].password)) {
      // compares provided password with the hashed password in the database
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      res.statusMessage = 'UserID/Email and password does not match!';
      res.status(403).send(res.statusMessage);
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null; // delete session cookie when logging out
  res.redirect('/urls');
});

// SET SERVER TO LISTEN TO SPECIFIED PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});