var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}
var urlDatabase = {
  "b2xVn2": {longUrl: "http://www.lighthouselabs.ca",
            userID: 'creator'},
  "9sm5xK": {longUrl: "http://www.google.com",
            userID: 'creator'}
};

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

app.get("/urls/new", (req, res) => {
  let currentUser = req.session.user_id;
  if(currentUser){
    res.render("urls_new");
  } else{
    res.redirect("/login")
  }
  

});

app.post("/login", (req,res)=>{
  // console.log("body ", req.body);
  // console.log("users[user].email: ", users[user].email)
  // console.log("req.body['user_id']: ", req.body['user.id'])
  // console.log("users[user].password: ", users[user].password)
  // console.log("req.body['password']): ", req.body['password']);

  for (user in users){
    console.log(req.body.password, users[user].password)
    if (users[user].email == req.body['user.id'] && bcrypt.compareSync(req.body.password, users[user].password)){
      req.session.user_id = req.body['user.id'];
      res.redirect("/");
      return;
    } else if(users[user].email == req.body['user.id'] && !bcrypt.compareSync(req.body.password, users[user].password)){
      res.status(403).send("password incorrect");
      return;
    }
  } 
  res.status(403).send("user does not exist");

});

app.get("/login", (req,res)=>{
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});
  


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let randomString = generateRandomString();
  console.log("inside post /urls before update, urlDatabase: ", urlDatabase);
  let newUrlEntry = {longUrl: req.body.longURL, userID: req.session.user_id};
  urlDatabase[randomString] = newUrlEntry;
  console.log("inside post /urls, after update urlDatabase: ", urlDatabase);


  //Respond with a redirection to http://localhost:8080/urls/<shortURL>
  res.redirect("http://localhost:8080/urls/" + randomString);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_id == urlDatabase[req.params.id].userID){
    delete urlDatabase[req.params.id];  
    res.redirect("http://localhost:8080/urls/");
  }else{
    res.status(403).send("need to be logged into the creator of this shortURL to delete it")
  }
})

app.post("/urls/:id/update/", (req, res) => {
  if(req.session.user_id == urlDatabase[req.params.id].userID){
    let updatedEntry = {longUrl: req.body.longURL, userID: req.session.user_id};
    urlDatabase[req.params.id] = updatedEntry;
    res.redirect("http://localhost:8080/urls/");
  }else{
    res.status(403).send("need to be logged into the creator of this shortURL to update it")
  }
})
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longUrl;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.session.user_id};
    console.log("req.session.user_id: ", req.session.user_id);
  res.render("urls_index", templateVars);
});
//register
app.get("/register", (req,res)=>{
  let templateVars = {
    urls: urlDatabase,
    user: req.session.user_id};
  res.render("urls_register", templateVars);
})
app.post("/register", (req,res)=>{
  //checks if email exists, if yes sets flag = 1
  let flag = 0;
  for (user in users){
    if (users[user].email == req.body.email){
      flag = 1;
    }
  }
  //if blank email or passowrd then return 400 error
  if (!req.body.email || !req.body.password){
    res.status(400).send('Invalid entry (need both email and password. blanks will return this page)')
  //if email exists return 400 error
  }else if(flag == 1){
    res.status(400).send('email already exists in database')
  //if email&password&no matching email, create new entry
  }else{
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log("inside post register, hashedPassword: ", hashedPassword)
    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    console.log("posted to register, current users object: ", users);
    res.redirect("login");  
  }

  
})
app.post("/logout", (req,res)=> {
  req.session.user_id = null;
  res.redirect("/urls");
})
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]){
    res.end("Page doesn't exist");
    res.status(404);
  }
  console.log("inside app.get('urls/:id')");
  console.log("req.session.user_id: ", req.session.user_id)
  console.log("urlDatabase[req.params.id].userID: ", urlDatabase[req.params.id].userID)
  if (req.session.user_id !== urlDatabase[req.params.id].userID){
    res.status(403).send("you need to be logged in or logged in as the user who created this page");
  }
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    user: req.session.user_id};

  res.render("urls_show", templateVars);
});
app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



function generateRandomString() {
  let randomString = Math.random().toString(36).substring(2,8);
  return randomString;
}
