const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const app = express();
app.use(express.json({limit: '5mb'}));
app.use(
  express.urlencoded({
    limit: '5mb',
    extended: true,
  })
);
app.use(cors());

/////////////////////////////Database Connection////////////////////////
const client = new Client({
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_DATABASE,
  // password: process.env.DB_PASS,
  // port: process.env.DB_PORT,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

/////////////////////////////Add New User///////////////////////////////
app.post("/api/user/adduser", (req, res) => {
  // console.log(req.body);
  client.query("SELECT email FROM public.user WHERE email=$1", [req.body.email])
  .then(result => {
    if(result.rows.length === 0){
      bcrypt.hash(req.body.password, saltRounds)
      .then(hash => {
        client.query("INSERT INTO public.user(name, email, password, dob, created_at) VALUES ($1, $2, $3, $4, NOW())", [req.body.name, req.body.email, hash, new Date(req.body.dob)])
        .then(result => {
          // console.log(result);
          res.send({message: "User Added Successfully"});
        })
        .catch(error => {console.log(error)});
      })
      .catch(error => {console.log(error)});
    }
    else{
      res.send({message: "User with same email already exists"});
    }
  })
  .catch(error => {console.log(error)});
});

////////////////////////////Authenticate/////////////////////////////////
app.post("/api/user/authenticate", (req, res) => {
  // console.log(req.body);
  client.query("SELECT userid, name, email, password FROM public.user WHERE email=$1", [req.body.email])
  .then(result => {
    if(result.rows.length === 0){
      res.send({message: "No such User found. Please Register"});
    }
    else{
      // console.log(result.rows);
        bcrypt.compare(req.body.password, result.rows[0].password)
        .then(function(same) {
            if(same){
                var token = jwt.sign({ userid: result.rows[0].userid, email: result.rows[0].email}, process.env.secretkey, {
                    expiresIn: 1800
                });
                res.send({
                    message: "Authentication Success",
                    userid: result.rows[0].userid,
                    name: result.rows[0].name,
                    accesstoken: token
                });
            }
            else{
                res.send({message: "Wrong Password"});
            }
        })
        .catch(error => {console.log(error)});
    }
  })
  .catch(error => {console.log(error)});
});

///////////////////////////Get User Details/////////////////////////////
app.get('/api/user/getuser', (req, res) => {
  if(req.headers.authorization === undefined){
    res.send({message: 'Access token required'});
    return;
  }
  jwt.verify(req.headers.authorization.split(' ')[1], process.env.secretkey, function(err, decoded) {
    if(err){
      // console.log(err);
      res.send(err);
    }
    else{
      // console.log(decoded);
      client.query("SELECT name, email, dob from public.user WHERE userid=$1", [decoded.userid])
      .then(result => {
        if(result.rows.length === 0){
          res.send({message: "User Not found"});
        }
        else{
          res.send({message: "User Found", ...result.rows[0]});
        }
      })
      .catch(error => {console.log(error)});
    }
  });
});

///////////////////////////Update User Details//////////////////////////
app.put("/api/user/updateuser", (req, res) => {
  console.log(req.body);
  if(req.headers.authorization === undefined){
    res.send({message: 'Access token required'});
    return;
  }
  else if(req.body.name === undefined || req.body.name === null || req.body.email === undefined || req.body.email === null || req.body.dob === undefined || req.body.dob === null){
    res.send({message: 'Provide the updated name, email and DOB of the user to be updated'});
    return;
  }
  jwt.verify(req.headers.authorization.split(' ')[1], process.env.secretkey, function(err, decoded) {
    if(err){
      // console.log(err);
      res.send(err);
    }
    else{
      // console.log(decoded);
      client.query("UPDATE public.user SET name=$1, email=$2, dob=$3, updated_at=NOW() WHERE userid=$4", [req.body.name, req.body.email, new Date(req.body.dob), decoded.userid])
      .then(result => {
        console.log(result);
        if(result.rowCount === 0){
          res.send({message: "User not found"});
        }
        else{
          res.send({message: "Update Successful"});
        }
      })
      .catch(error => {
        console.log(error);
      });
    }
  });
});

/////////////////////////////Update User Password///////////////////////
app.put("/api/user/updatepassword", (req, res) => {
  // console.log(req.headers);
  if(req.headers.authorization === undefined){
    res.send({message: 'Access token required'});
    return;
  }
  else if(req.body.oldpassword === undefined || req.body.oldpassword === null || req.body.newpassword === undefined || req.body.newpassword === null){
    res.send({message: 'Provide the oldpassword and newpassword of the user to be updated'});
    return;
  }
  jwt.verify(req.headers.authorization.split(' ')[1], process.env.secretkey, function(err, decoded) {
    if(err){
      // console.log(err);
      res.send(err);
    }
    else{
      // console.log(decoded);
      client.query("SELECT password from public.user WHERE userid=$1", [decoded.userid])
      .then(result => {
        if(result.rows.length === 0){
          res.send({message: "No User found"});
        }
        else{
          bcrypt.compare(req.body.oldpassword, result.rows[0].password)
          .then(function(same) {
            if(same){
              bcrypt.hash(req.body.newpassword, saltRounds)
              .then(hash => {
                client.query("UPDATE public.user SET password=$1, updated_at=NOW() WHERE userid=$2", [hash, decoded.userid])
                .then(result => {
                  res.send({message: "Password updated successfully"});
                })
                .catch(error => {console.log(error)});
              })
              .catch(error => {console.log(error)});
            }
            else{
              res.send({message: "Current password Incorrect"});
            }
          })
          .catch(error => {console.log(error)});
        }
      })
      .catch(error => {
        console.log(error);
      });
    }
  });
});

////////////////////////////Forgot Password//////////////////////////////
app.post("/api/user/forgotpwd/auth", (req, res) => {
  // console.log(req.body);
  client.query("SELECT userid, email, dob FROM public.user WHERE email=$1", [req.body.email])
  .then(result => {
    if(result.rows.length === 0){
      res.send({message: "No such User found. Please Register"});
    }
    else{
      var d1 = new Date(req.body.dob);
      var d2 = new Date(result.rows[0].dob);
      // console.log(+d1 === +d2);
      if(+d1 === +d2){
        bcrypt.hash(req.body.password, saltRounds)
        .then(hash => {
          client.query("UPDATE public.user SET password=$1, updated_at=NOW() WHERE userid=$2", [hash, result.rows[0].userid])
          .then(result => {
            res.send({message: "Password updated successfully"});
          })
          .catch(error => {console.log(error)});
        })
        .catch(error => {console.log(error)});
      }else{
        res.send({message: "The DOB is incorrect"});
      }
    }
  })
  .catch(error => {
    console.log(error);
  });
});


//////////////////////////////Port Setup////////////////////////////////
app.listen(process.env.PORT || "5000", function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is up on port 5000");
  }
});