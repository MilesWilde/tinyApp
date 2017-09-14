var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const users = { 
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
}


app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

app.get("/urls/new", (req, res) => {
  res.render("urls_new");

});

app.post("/login", (req,res)=>{
  // console.log("body ", req.body);
  // console.log("users[user].email: ", users[user].email)
  // console.log("req.body['user_id']: ", req.body['user.id'])
  // console.log("users[user].password: ", users[user].password)
  // console.log("req.body['password']): ", req.body['password']);
  for (user in users){
    if (users[user].email == req.body['user.id'] && users[user].password == req.body['password']){
      res.cookie("user_id", req.body['user.id']);    
      res.redirect("/");
    } else if(users[user].email == req.body['user.id'] && users[user].password != req.body['password']){
      res.status(403).send("password incorrect");
    } 
  }
  res.status(403).send("user does not exist");
});

app.get("/login", (req,res)=>{
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    user: users[req.cookies.user_id]};
  res.render("urls_login", templateVars);
});
  


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);


  //Respond with a redirection to http://localhost:8080/urls/<shortURL>
  res.redirect("http://localhost:8080/urls/" + randomString);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("http://localhost:8080/urls/");
})

app.post("/urls/:id/update/", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/");
})
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies.user_id};
    console.log("req.cookies.user_id: ", req.cookies.user_id);
  res.render("urls_index", templateVars);
});
//register
app.get("/register", (req,res)=>{
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies.user_id};
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
    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
    console.log("posted to register, current users object: ", users);
    res.redirect("login");  
  }

  
})
app.post("/logout", (req,res)=> {
  res.clearCookie("user_id");
  res.redirect("/urls");
})
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]){
    res.end("Page doesn't exist");
    res.status(404);
  }
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    user: users[req.cookies.user_id]};

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
