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
  verifyEmail, 
  verifyUserID, 
  validateURL
} = require('./helper');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.set('view engine', 'ejs');
app.use(cookieSession({
  'name': 'session',
  'keys': ['secret', 'rahasia', 'key'],
  'maxAge': 24 * 60 * 60 * 1000 // set max cookie age to 24 hours
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
    'longURL': "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    'userID': "jamesBly",
    'longURL': "http://www.google.com"
  }
};

// THIS SECTION IS ALL GET REQUESTS

app.get('/', (req, res) => {
  const templateVars = {
    username: req.session.user_id
  }
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.session.user_id
  }
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.session.user_id
  }
  if(req.session.user_id) {
    res.redirect('urls');
  } else {
    res.render('login', templateVars);
  }
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session.user_id 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session.user_id
  }
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    username: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = '';
    if (urlDatabase[shortURL]) {
      longURL = urlDatabase[shortURL]['longURL'];
      res.redirect(longURL);
    } else {
      res.redirect('/urls');
    }
});

app.get('/error', (req, res) => {
  const templateVars = {
    username: req.session.user_id
  }
  res.render('error', templateVars);
});

// THIS SECTION IS ALL POST REQUESTS

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(req.session.user_id) {
    if (urlDatabase[shortURL]) {
      urlDatabase[shortURL]['longURL'] = req.body.newURL;
      res.redirect(`/urls/${shortURL}`);
    } 
  } else {
    res.sendStatus(403);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls')
  } else {
    res.sendStatus(403);
  }
});

app.post("/urls", (req, res) => {
  if(req.session.user_id) {
    const shortURL = generateRandomString();
    let longURL = req.body.longURL;

    if (validator.isURL(longURL)) { // check if input is a URL
      // add http:// if input does not contain (http:// | https:// | ftp://)
      longURL = validateURL(longURL);
      urlDatabase[shortURL] = {
        'longURL': longURL,
        'userID': req.session.user_id
      }
        res.redirect(`/urls/${shortURL}`);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

app.post('/register', (req, res) => {
  const userID = req.body.userID;
  const email = req.body.email;
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!userID || !email || !password) {
    res.redirect('/error'); // create a page to show message!
  } else if (verifyEmail(email) || verifyUserID(userID)) {
    res.redirect('/error'); // create a page to show message!
  } else {
    users[userID] = {
      'id': userID,
      'email': email,
      'password': hashedPassword
    };
    req.session.user_id = userID;
    console.log(`registered new User:`, JSON.stringify(users[userID]));
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const usernameInput = req.body.username;
  const passwordInput = req.body.password;
  let userID = '';
  if (!verifyEmail(usernameInput, users) && !verifyUserID(usernameInput, users)) {
    return res.sendStatus(403);
  } else if (verifyEmail(usernameInput, users)) {
    userID = verifyEmail(usernameInput, users);
    if (bcrypt.compare(passwordInput, users[userID].password)) {
      req.session.user_id = userID;
      res.redirect('/urls');
    } else {
      res.sendStatus(403); // create a page to show message!
    } 
  } else if (verifyUserID(usernameInput, users)) {
    userID = verifyUserID(usernameInput, users);
    if(bcrypt.compare(passwordInput, users[userID].password)) {
      req.session.user_id = userID;
      res.redirect('/urls');
      return;
    } else {
      return res.sendStatus(403); // create a page to show message!
    }
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// SET SERVER TO LISTEN TO SPECIFIED PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});