var MongoClient = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/";

(function() 
 {
	var fs, http, qs, server, url, nmail;
	http = require('http');
	url = require('url');
	qs = require('querystring');
	fs = require('fs');
  nmail = require('nodemailer');
	
	var loginStatus = false, loginUser = "";
	
	server = http.createServer(function(req, res) 
	{
		var action, form, formData, msg, publicPath, urlData, stringMsg, params;
		urlData = url.parse(req.url, true);
		action = urlData.pathname;
    params = urlData.query;
		publicPath = __dirname + "\\public\\";
		console.log("[Action=" + action + "][ReqURL=" + req.url + "]");
				
		if (action === "/Signup") 
		{
      console.log("[Action:" + action + "]");
			if (req.method === "POST") 
			{
				console.log("[Method:" + req.method + "]");
        
        // GET DATA FROM FORM
        formData = '';
        req.on('data', function(data) {
          formData += data;
          console.log("[FormData:" + formData + "]");
          var signupMsgArray = formData.split("&"); // [login=xxx][pass=yyy][repass=yyy][email=zzz]
					var tempSignupLogin = signupMsgArray[0]; // "login=xxx"
					var signupLoginArray = tempSignupLogin.split("="); // "[login][xxx]"
          var signupLogin = signupLoginArray[1]; // "xxx"
          
					var tempSignupPass = signupMsgArray[1]; // "pass=yyy"
					var signupPassArray = tempSignupPass.split("="); // "[pass][yyy]"
          var signupPass = signupPassArray[1]; // "yyy"
          
          var tempSignupEmail = signupMsgArray[3]; // "email=zzz"
					var signupEmailArray = tempSignupEmail.split("="); // "[email][zzz]"
          var signupEmail = signupEmailArray[1]; // "zzz"
					signupEmail = signupEmail.replace("%40","@"); // change %40 to @
          
          console.log("Login:" + signupLogin);
          console.log("Pass:" + signupPass);
          console.log("Email:" + signupEmail);
          
          // WRITE USER TO DB
          MongoClient.connect(dbUrl, function(err, db) {
              var dbo = db.db("mydb");
              if (err) {
                console.log("Connection failed");
              }
              // INSERT USER
              dbo.collection("student").insertOne({ "user": signupLogin, "pass": signupPass, 
                                                   "email": signupEmail, "active": 'no' }, function(err, result) {
                if (err) {
                  // INSERT ERROR
                  console.log(err);
                }else{
                  // INSERT SUCCESSFUL
                  console.log("[Insert Successful]");
                  // SEND EMAIL
                  var transporter = nmail.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'aynodemailer@gmail.com',
                      pass: '82228222'
                    }
                  });        
                  var mailOptions = {
                    from: 'aynodemailer@gmail.com',
                    to: signupEmail,
                    subject: 'Activation Email',
                    text: 'Hi ' + signupLogin + '\n\n' + 'Please click this link to activate your account' + '\n\n' +
                    'http://port-7788.puk_kwanho-hosonpuk430951.codeanyapp.com/Activate?login=' + signupLogin
                  };
                  console.log("[Send Email]");
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                  
                  // SHOW SIGNUP OK
                  form = "signupok.html";
                  return fs.readFile(form, function(err, contents) 
                  {
                    if (err !== true) 
                    {
                      res.writeHead(200, 
                      {
                        "Content-Type": "text/html"
                      });
                      return res.end(contents);
                    } 
                    else 
                    {
                      res.writeHead(500);
                      return res.end;
                    }
                  });	
                  
                }
              });                        
              db.close();
          });      
        });
			} 
			else 
			{

				form = "signup.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						res.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return res.end(contents);
					} 
					else 
					{
						res.writeHead(500);
						return res.end;
					}
				});
			}
		}
    else if (action === "/AddFavour"){
      console.log("[Action:" + action + "]");
 			if (req.method === "POST") 
			{
				console.log("[Method:" + req.method + "]");
        
        // GET DATA FROM FORM
        formData = '';
        req.on('data', function(data) {
          formData += data;
          console.log("[FormData:" + formData + "]");
          var addFavourMsgArray = formData.split("&"); // [user=xxx][title=yyy][link=zzz]
					var tempAddFavourUser = addFavourMsgArray[0]; // "user=xxx"
					var addFavourUserArray = tempAddFavourUser.split("="); // "[user][xxx]"
          var addFavourUser = addFavourUserArray[1]; // "xxx"
          
					var tempAddFavourTitle = addFavourMsgArray[1]; // "title=yyy"
					var addFavourTitleArray = tempAddFavourTitle.split("="); // "[title][yyy]"
          var addFavourTitle = addFavourTitleArray[1]; // "yyy"
          
          var tempAddFavourLink = addFavourMsgArray[2]; // "link=zzz"
					var addFavourLink = tempAddFavourLink.replace("link=",""); // "zzz"
					          
          console.log("User:" + addFavourUser);
          console.log("Title:" + addFavourTitle);
          console.log("Link:" + addFavourLink);
          
          // WRITE FAVOUR TO DB
          MongoClient.connect(dbUrl, function(err, db) {
              var dbo = db.db("mydb");
              if (err) {
                console.log("Connection failed");
              }
              // INSERT FAVOUR
              dbo.collection("favourlist").insertOne({ "command": addFavourLink, 
                                                      "texttitle": addFavourTitle, 
                                                      "user": addFavourUser }, function(err, result) {
                if (err) {
                  // INSERT ERROR
                  console.log(err);
                }else{
                  // INSERT SUCCESSFUL
                  console.log("[Insert Successful]");
                  return res.end("Added to favourlist");
                }
              });                        
              db.close();
          });      
        });
			}      
    }
    else if (action === "/DeleteFavour"){
      console.log("[Action:" + action + "]");
 			if (req.method === "POST") 
			{
				console.log("[Method:" + req.method + "]");
        
        // GET DATA FROM FORM
        formData = '';
        req.on('data', function(data) {
          formData += data;
          console.log("[FormData:" + formData + "]");
          
					var deleteFavourTitle = formData.replace("title=","");
					          
          console.log("User:" + loginUser);
          console.log("Title:" + deleteFavourTitle);
          
          // WRITE FAVOUR TO DB
          MongoClient.connect(dbUrl, function(err, db) {
              var dbo = db.db("mydb");
              if (err) {
                console.log("Connection failed");
              }
              // DELETE FAVOUR
              dbo.collection("favourlist").removeOne({ "texttitle": deleteFavourTitle, 
                                                      "user": loginUser }, function(err, result) {
                if (err) {
                  // DELETE ERROR
                  console.log(err);
                }else{
                  // DELETE SUCCESSFUL
                  console.log("[Delete Successful]");
                  return res.end("Deleted");
                }
              });                        
              db.close();
          });      
        });
			}      
    }    
    else if (action === "/Favour"){
      return fs.readFile("favourlist.html", function(err, contents) 
        {
          if (err !== true) 
          {
            res.writeHead(200, 
            {
              "Content-Type": "text/html"
            });
            return res.end(contents);
          } 
          else 
          {
            res.writeHead(500);
            return res.end;
          }
        });
    }
    else if (action === "/Activate"){
      console.log("[Action:" + action + "]");
      console.log("[Login=" + params.login + "]");
      var activationLogin = params.login;

       // ACTIVATE USER IN DB - START
      MongoClient.connect(dbUrl, function(err, db) {
      var dbo = db.db("mydb");
      if (err) {
        console.log("Connection failed");
      }

      // UPDATE USER TO ACTIVE
      var userQuery = {"user":activationLogin};
      dbo.collection("student").updateOne(userQuery,{ $set: {active: "yes"} }, function(err, result) {
        if (err) {
          // UPDATE ERROR
          console.log(err);
        }else{
          if(result.result.nModified == 1){
            // UPDATE SUCCESSFUL
            console.log("[Update Successful, Modified:" + result.result.nModified + "]");  
            form = "activationok.html";
          }else{
            // UPDATE FAIL
            console.log("[Update Failed, Modified:" + result.result.nModified + "]");
            form = "activationfail.html";
          }

          // SHOW ACTIVATION RESULT
          
          return fs.readFile(form, function(err, contents) 
          {
            if (err !== true) 
            {
              res.writeHead(200, 
              {
                "Content-Type": "text/html"
              });
              return res.end(contents);
            } 
            else 
            {
              res.writeHead(500);
              return res.end;
            }
          });	
        }
      });                        
      db.close();
      }); 
      // ACTIVATE USER IN DB - END       



    }
    else if (action === "/Logout")
    {
      console.log("[Action:" + action + "]");
      if (req.method === "POST") 
			{
        loginUser = "";
        loginStatus = false;
        return res.end("Logout successful!");
      }
    }
    else if (action === "/CheckLogin")
    {
      console.log("[Action:" + action + "]");
      if (req.method === "POST") 
			{
        console.log("LoginUser:[" + loginUser + "]");
        return res.end(loginUser);
        /*
        if(!loginUser){
          return res.end("Please login to add favourlist");  
        }else{
          return res.end("Hello " + loginUser);  
        }
        */
      }
    }
    else if (action === "/Search")
    {
      console.log("[Action:" + action + "]");
				return fs.readFile("search.html", function(err, contents) 
				{
					if (err !== true) 
					{
						res.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return res.end(contents);
					} 
					else 
					{
						res.writeHead(500);
						return res.end;
					}
				});
    }    
    else if (action === "/Login")
		{
			console.log("[Action:" + action + "]");
			if (req.method === "POST") 
			{
				console.log("[Method:" + req.method + "]");
    
				formData = '';
				msg = '';
				return req.on('data', function(data) 
				{
					formData += data;
          
					console.log("[Raw data:"+ formData + "]");
					return req.on('end', function() 
					{
						//var user;
						//user = qs.parse(formData);
						//msg = JSON.stringify(user);
						//stringMsg = JSON.parse(msg);
						
            var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];
						var splitName = tempSplitName.split("=");
						var tempPassword = splitMsg[1];
						var splitPassword = tempPassword.split("=");
					  var tryusername = splitName[1];
            var trypassword = splitPassword[1];
            
            console.log("[Username=" + tryusername + "][Password=" + trypassword + "]");
						//res.writeHead(200, 
					//	{
					//		"Content-Type": "application/json",
					//		"Content-Length": msg.length
					//	});
				   // return res.end("hi iam logins");
      
            
            // 1. connect mongo db
            MongoClient.connect(dbUrl, function(err, db) {
              var dbo = db.db("mydb");
              if (err) {
                console.log("Connection failed");
              }
              // check username
              dbo.collection("student").find({$and: [{'user':tryusername},{'pass':trypassword},{'active':'yes'}]}).toArray(function(err, result) {
                if (err) throw err;
                  // console.log("[RESULT:" + result + "]");
                  if(result == ''){
                    console.log("USER NOT FOUND!");
                    return res.end("Login failed!");
                  }else{
                    // LOGIN SUCCESSFUL
                    loginStatus = true;
                    loginUser = tryusername;
                    console.log("USER FOUND!");                    
                    return res.end("Login successful!");
                  }
              });
           
       
          //  dbo.collection("student").insertOne({ "name": "ALEX NG", "age": "18" }, function(err, result) {
         //   if (err) {
        //        console.log(err);
         //   }
    
          //  })

/* 
            dbo.collection("student").insertMany([{ "name": "Peter Pan", "age": "18" }, { "name": "Iron Man" }], function(err, result) {
            if (err) {
                console.log(err);
            }
            console.log(result);
            })

             return res.end("Connection succeed");
         */
         
         // DISPLAY TABLE
         /*
          console.log("STUDENT TABLE");
          console.log("*************");
                dbo.collection("student").find({}).toArray(function(err, result) {
                if (err) throw err;
                  console.log(result);
            
                });
         */
             ////monogodb delete record 
            //  dbo.collection("student").remove({'age':'18'},function(err, result) {
             //   if (err) throw err;
              //    console.log(result);
            
           //     });
             
               db.close();
            })
        ////////////end connect mongo db    
            
            
            
            
					});
				});
        
       
			}
			else 
			{
				//form = publicPath + "ajaxSignupForm.html";
				form = "login.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						res.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return res.end(contents);
					} 
					else 
					{
						res.writeHead(500);
						return res.end;
					}
				});
			}
      
      
       
		}
	
		else if (action === "/ReadFavouriteList")
		{
      console.log("[Action:" + action + "]");
			if(!loginStatus)
			{
				console.log("No logged in user found.");
        return res.end("");
			}
			else
			{
				console.log("read favour");
				MongoClient.connect(dbUrl, function(err, db) 
				{
					var finalcount;
					if (err) throw err;
					var dbo = db.db("mydb");
					var myobj = stringMsg;
					dbo.collection("favourlist").find({"user" : loginUser}, {"_id" : 0, "command" : 1, "texttitle" : 1, "user" : 0}).toArray(function(err, result) 
					{
    				if (err) throw err;
    				console.log(result);
    				db.close();
						var resultReturn = JSON.stringify(result);
						console.log(resultReturn);
            return res.end(resultReturn);
					});
				});
			}
		}

		else 
		{
      //handle redirect
			if(req.url === "/index")
			{
        if(loginStatus)
				{
					sendFileContent(res, "login.html", "text/html");
				}
				else
				{
					sendFileContent(res, "client.html", "text/html");
				}
			}
			else if (req.url === "/Info")
			{
				sendFileContent(res, "info.html", "text/html");
			}
			else if (req.url === "/Video")
			{
				sendFileContent(res, "video.html", "text/html");
			}
			else if (req.url === "/Game")
			{
				sendFileContent(res, "game.html", "text/html");
			}      
			else if (req.url === "/blank")
			{
				sendFileContent(res, "blank.html", "text/html");
			}
			else if (req.url === "/test")
			{
				sendFileContent(res, "index-backup.html", "text/html");
			}
			else if(req.url === "/")
			{
        sendFileContent(res, "index.html", "text/html");
        /*
				console.log("Requested URL is url" + req.url);
				res.writeHead(200, 
				{
					'Content-Type': 'text/html'
				});
				res.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + req.url);
        */
        
			}
			else if(/^\/[-a-zA-Z0-9\/]*.js$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "text/javascript");
			}
			else if(/^\/[-a-zA-Z0-9\/]*.css$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "text/css");
			}
      else if(/^\/[-a-zA-Z0-9\/]*.min.css$/.test(req.url.toString()))
      {
		    sendFileContent(res, req.url.toString().substring(1), "text/css");
      }
      else if(/^\/[-a-zA-Z0-9\/]*.prefix.css$/.test(req.url.toString()))
      {
		    sendFileContent(res, req.url.toString().substring(1), "text/css");
      }      
			else if(/^\/[-a-zA-Z0-9\/]*.jpg$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "image/jpg");
			}
      else if(/^\/[-a-zA-Z0-9\/]*.png$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "image/png");
			}
			else if(/^\/[-a-zA-Z0-9\/]*.gif$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "image/gif");
			}      
			else
			{
				console.log("Requested URL is: " + req.url);
				res.end();
			}

		}
	});

	server.listen(7788);

	console.log("Server is running : " + new Date());


	function sendFileContent(response, fileName, contentType)
	{
		fs.readFile(fileName, function(err, data)
		{
			if(err)
			{
				response.writeHead(404);
				response.write("Not Found!");
			}
			else
			{
				response.writeHead(200, {'Content-Type': contentType});
				response.write(data);
			}
			response.end();
		});
	}
 }).call(this);
