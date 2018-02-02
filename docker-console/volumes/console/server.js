const TokenGenerator = require('uuid-token-generator');
var mysql = require('mysql');
var ldap = require('ldapjs');
var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var app = express();
const pwgen = new TokenGenerator();
const tokgen = new TokenGenerator(512);
var TAaccount = "carlos"
var sdmGroup = "SDM2017"

var con = mysql.createPool({
  connectionLimit: 2,
  host: "mysql",
  user: "root",
  password: "iamsdmadmin",
  database: "console"
});

var client = ldap.createClient({
  url: 'ldap://ldap',
  timeout: 2000
});

client.unbind(function(err){
  client.bind('cn=admin,dc=sdm,dc=im,dc=ntu,dc=edu,dc=tw', 'bj03wu3d9z8z;z83', function(binderr) {
    if(!binderr) { 
      console.log("admin bind successfully");
    }else{
      console.log(binderr);
    }
  });
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'softwaredevelopmentmethodta@gmail.com',
      pass: 'iamsdmadmin'
    }
  });


app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use("/js", express.static(__dirname + '/js'));
app.use("/css",  express.static(__dirname + '/css'));
app.use("/fonts",  express.static(__dirname + '/fonts'));

app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile('index.html', {root: __dirname });
})

app.post('/sign_up', function (req, res) {
   console.log("Got a POST request for /sign_up");
   if(isIDvalid(req.body.userId)){
     res.send(signup(req.body.userId));
   } else {
     res.send("ID format is not valid");
   }
})

app.get('/verify', function (req, res) {
   console.log("Got a GET request for /verify");
   console.log(req.query);
   if(isIDvalid(req.query.userId) && ispwvalid(req.query.token)){
     verify(req.query.userId, req.query.token);
     res.send("verify successfully!\r\nPlease go to <a href='https://sdm.im.ntu.edu.tw'>https://sdm.im.ntu.edu.tw</a> and change your password first.");
   } else {
     res.send("invalid link!")
   }
})


app.post('/change_pw', function(req, res) {   
   console.log("Got a POST request for /changepw");
   console.log(req.body);
   if(isIDvalid(req.body.userId) && ispwvalid(req.body.password) && ispwvalid(req.body.newpassword)){
     res.send(changepw(req.body.userId, req.body.password, req.body.newpassword));
   }else{
     res.send("invalid format of ID or password");
   }
})


app.post('/sso_check', function(req, res) {
   console.log("Got a POST request for /sso_check");
   console.log(req.body);
   res.setHeader('Content-Type', 'application/json');
   if(isIDvalid(req.body.userId) && ispwvalid(req.body.password)){
     ssoCheck(req.body.userId, req.body.password, function(err, result){
       if(err){
         res.send(JSON.stringify({ "error" : err }));
       } else {
         res.send(JSON.stringify({ "result" : result }));
       }
     });
   }else{
     res.send(JSON.stringify({ "error" : "invalid format of ID or password" }));
   }
})


app.post('/sso_update', function(req, res) {
   console.log("Got a POST request for /sso_update");
   console.log(req.body);
   if(isIDvalid(req.body.userId) && ispwvalid(req.body.password) && isurlvalid(req.body.usersp) && isurlvalid(req.body.loginto) && isurlvalid(req.body.logoutto)){
     ssoUpdate(req.body.userId, req.body.password, req.body.usersp, req.body.loginto, req.body.logoutto, function(message){
       res.send(message);
     });
   }else{
     res.send("invalid format of ID, password or url");
   }
})



var server = app.listen(8080, function () {
   console.log('server is running');
})


function signup(userId){
  var deletesql = "DELETE FROM waitVerifyUsers WHERE verify = 0 AND studentId = '" + userId + "'";
  con.query(deletesql, function (err, result) {
    if(err) console.error(err);
  });
  var password = pwgen.generate();
  var emailAddress = userId + '@ntu.edu.tw';
  var token = tokgen.generate();
  var insertsql = "INSERT INTO waitVerifyUsers SET ?";
  var value = {studentId: userId, password: password, email: emailAddress, token: token, verify: 0};
  setTimeout(function(){
    con.query(insertsql, value, function (err, result) {
      if(err) console.error(err);
    })
  },1000);

  var content = "Hi " + userId + ":\r\nHere is your default password : " + password + "\r\n" + 
                "Please click the following link and change your password immediately.\r\n" + 
                "Hope you have a great semester!\r\n" + 
                "https://sdm.im.ntu.edu.tw/verify?userId=" + userId + "&token=" + token;
  var mailOptions = {
    from: 'softwaredevelopmentmethodta@gmail.com',
    to: emailAddress,
    subject: 'SDM Git Account Verify Mail : ' + userId,
    text: content
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  return "Signup successfully. Please check your NTU email account.";
}

function isIDvalid(userId){
  return /^[brtd][0-9]{2}[0-9abhjk][0-9]{5}$/i.test(userId) || userId == TAaccount;
}

function ispwvalid(password){
  return /^[a-zA-Z0-9]{6,}$/i.test(password);
}

function isurlvalid(url){
  return /^https?:\/\/[a-zA-Z0-9.:\/_\-#]{0,}$/.test(url);
}

function verify (userId, token){
  var selectsql = "SELECT password FROM waitVerifyUsers WHERE studentId = '" + userId + "' AND token = '" + token + "' AND verify = 0";
  con.query(selectsql, function (err, result) {
    if(result[0] != null) {
      var emailAddress = userId + '@ntu.edu.tw';
      var entry = {
        cn: userId,
        sn: '0',
        givenName: userId,
        email: emailAddress,
        userPassword: result[0].password,
        objectClass: ['sdmUser', 'person', 'top']
      };
      var dn = 'cn=' + userId + ',ou=' + sdmGroup + ',ou=Students,ou=Users,dc=sdm,dc=im,dc=ntu,dc=edu,dc=tw';
      client.add(dn, entry, function(err) {
        if(err) {
          console.error("add err:" + err);
        }else{
          console.log(dn + "verify OK!")
        }
        var updatesql = "UPDATE waitVerifyUsers SET verify = 1 WHERE studentId = '" + userId + "' AND token = '" + token + "'";
        con.query(updatesql, function (err, result) {
          if(err) console.error("update err:" + err);
        });
      });
    }else{
      console.log("selecterr :" + err + result);
    }
  });
}


function changepw(userId, password, newPassword){
  var dn = 'cn=' + userId + ',ou=' + sdmGroup + ',ou=Students,ou=Users,dc=sdm,dc=im,dc=ntu,dc=edu,dc=tw';
  var change = new ldap.Change({
    operation: 'replace',
    modification: {
      userPassword: newPassword,
    }
  });
  client.compare(dn, 'userPassword', password, function(compareerr, matched) {
    console.log(matched);
    if(compareerr){
      console.error(dn + '. compareerr : ' + compareerr);
    } else if (matched){
      client.modify(dn, change, function(modifyerr) {
        if (modifyerr) {
          console.error(dn + '. modifyerr : ' + modifyerr);
        } else {
          console.log(dn + "change password OK!")
        }
      });
    } else {
      console.log(dn + "wrong password");
    }
  });

  return "Change password successfully";
}


function ssoCheck(userId, password, callback){
  var dn = 'cn=' + userId + ',ou=' + sdmGroup + ',ou=Students,ou=Users,dc=sdm,dc=im,dc=ntu,dc=edu,dc=tw';
  client.compare(dn, 'userPassword', password, function(compareerr, matched) {
    if(compareerr){
      console.error(dn + '. compareerr : ' + compareerr);
      callback(compareerr, null);
    } else if (matched){
      var sql = "SELECT * FROM sso_sp_list WHERE ID = '" + userId + "'";
      con.query(sql, function (err, result) {
        if(err) { 
          console.error(err);
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      console.log(dn + "wrong password");
      callback("wrong password", null);
    }
  });
}



function ssoUpdate(userId, password, usersp, loginto, logoutto, callback){
  var dn = 'cn=' + userId + ',ou=' + sdmGroup + ',ou=Students,ou=Users,dc=sdm,dc=im,dc=ntu,dc=edu,dc=tw';
  client.compare(dn, 'userPassword', password, function(compareerr, matched) {
    if(compareerr){
      console.error(dn + '. compareerr : ' + compareerr);
      callback("bind error. please contact TA");
    } else if (matched){
      var sql = "INSERT INTO sso_sp_list (ID, metadata_url, login_callback_url, logout_callback_url) " + 
                "VALUES ('" + userId + "', '" + usersp + "', '" + loginto + "', '" + logoutto + "') " +
                "ON DUPLICATE KEY UPDATE metadata_url = '" + usersp + "', login_callback_url = '" + loginto + "', logout_callback_url = '" + logoutto + "'";
      con.query(sql, function (err, result) {
        if(err){
	  console.error(err);
	  callback("update error. please contact TA");
        } else {
	  callback("Change SSO settings successfully! Please check settings again by clicking check button");
        }
      });
    } else {
      callback("Wrong ID or password");
      console.log(dn + ": wrong password");
    }
  });
}
