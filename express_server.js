const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('tiny'));
app.set('view engine', 'ejs');

const generateRandomString = function() {
  let randomChar = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase();
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }
  return output;
};

const users = {
  'admin': {
    'id': 'admin',
    'email': 'admin@tinyapp.com',
    'password': 'superpassword'
  },
  'jamesBly': {
    'id': 'jamesBly',
    'email': 'jamesbly@example.com',
    'password': 'password123'
  }
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('This is the Homepage!');
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"]
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies['user_id']
  }
  res.render('login', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if(!urlDatabase[shortURL]) {
  res.redirect('/urls');
  }
  res.redirect(longURL);
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/register', (req, res) => {
  const userID = req.body.userID;
  const email = req.body.email;
  const password = req.body.password;
  if (!userID || !email || !password) {
    return res.sendStatus(403);
  };
  if (verifyEmail(email) || verifyUserID(userID)) {
    return res.sendStatus(403);
  }
  users[userID] = {
    'id': userID,
    'email': email,
    'password': password
  };
  res.cookie('user_id', userID);
  console.log(`registered new User:`, JSON.stringify(users[userID]));
  res.redirect('/urls');
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
    if (users[userID].password === passwordInput) {
      res.cookie('user_id', userID);
      res.redirect('/urls');
      return;
    } else {
      return res.sendStatus(403);
    }
  }
  if (verifyUserID(usernameInput)) {
    userID = verifyUserID(usernameInput);
    if(users[userID].password === passwordInput) {
      res.cookie('user_id', userID);
      res.redirect('/urls');
      return;
    } else {
      return res.sendStatus(403);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});