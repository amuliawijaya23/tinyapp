const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.set('view engine', 'ejs');

app.use(cookieSession({
  'name': 'session',
  'keys': ['key1', 'key2', 'key3'],
  'maxAge': 24 * 60 * 60 * 1000 // set max cookie age to 24 hours
}));

const generateRandomString = function() {
  let randomChar = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase();
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }
  return output;
};

const validateEmail = (email) => {
  const form = /\S+@\S+\.\S+/;
  return form.test(email); //validate email using regex in the form of "string@string.string"
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
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      'longURL': longURL,
      'userID': req.session.user_id
    }
    res.redirect(`/urls/${shortURL}`);
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
    return res.sendStatus(403); // create a page to show message!
  };
  if (verifyEmail(email) || verifyUserID(userID)) {
    return res.sendStatus(403); // create a page to show message!
  };
  if (validateEmail(email)) {
    users[userID] = {
      'id': userID,
      'email': email,
      'password': hashedPassword
    };
    req.session.user_id = userID;
    console.log(`registered new User:`, JSON.stringify(users[userID]));
    res.redirect('/urls');
  };
});

app.post('/login', (req, res) => {
  const usernameInput = req.body.username;
  const passwordInput = req.body.password;
  let userID = '';
  if (!verifyEmail(usernameInput) && !verifyUserID(usernameInput)) {
    return res.sendStatus(403);
  }
  if (verifyEmail(usernameInput)) {
    userID = verifyEmail(usernameInput);
    if (bcrypt.compare(passwordInput, users[userID].password)) {
      req.session.user_id = userID;
      res.redirect('/urls');
      return;
    } else {
      return res.sendStatus(403); // create a page to show message!
    }
  }
  if (verifyUserID(usernameInput)) {
    userID = verifyUserID(usernameInput);
    if(bcrypt.compare(passwordInput, users[userID].password)) {
      req.session.user_id = userID;
      res.redirect('/urls');
      return;
    } else {
      return res.sendStatus(403); // create a page to show message!
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});