var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

app.get("/urls/new", (req, res) => {
  res.render("urls_new");

});

app.post("/login", (req,res)=>{
  
  res.cookie("username",req.body.username);
  res.redirect("/urls");
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
    username: req.cookies["username"],};
  res.render("urls_index", templateVars);
});

app.post("/logout", (req,res)=> {
  res.clearCookie("username");
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
    username: req.cookies["username"], };
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
