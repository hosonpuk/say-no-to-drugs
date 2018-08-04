var MongoClient = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/";

(function() 
 {
	var fs, http, qs, server, url;
	http = require('http');
	url = require('url');
	qs = require('querystring');
	fs = require('fs');
	
	var loginStatus = false, loginUser = "";
	
	server = http.createServer(function(req, res) 
	{
		var action, form, formData, msg, publicPath, urlData, stringMsg;
		urlData = url.parse(req.url, true);
		action = urlData.pathname;
		publicPath = __dirname + "\\public\\";
		console.log(req.url);
		
		
		
		if (action === "/Signup") 
		{
			console.log("signup");
			if (req.method === "POST") 
			{
		
				
			} 
			else 
			{

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

    else if (action === "/Login")
		{
			console.log("login");
			if (req.method === "POST") 
			{
				console.log("action = post");
    
				formData = '';
				msg = '';
				return req.on('data', function(data) 
				{
					formData += data;
          
					console.log("form data server="+ formData);
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
					
            console.log(tempSplitName);
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
              console.log("Connection failed")
            }
              
           
       
          //  dbo.collection("student").insertOne({ "name": "ALEX NG", "age": "18" }, function(err, result) {
         //   if (err) {
        //        console.log(err);
         //   }
    
          //  })


            dbo.collection("student").insertMany([{ "name": "Peter Pan", "age": "18" }, { "name": "Iron Man" }], function(err, result) {
            if (err) {
                console.log(err);
            }
            console.log(result);
            })

             return res.end("Connection succeed");
             
              
              
   
                dbo.collection("student").find({}).toArray(function(err, result) {
                if (err) throw err;
                  console.log(result);
            
                });
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
	
		else if (action === "/readfavourlist")
		{
			if(!loginStatus)
			{
				console.log("no logged in user found");
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
					dbo.collection("favourlist").find({"user" : loginUser}, {"_id" : 0, "command" : 1, "texttitle" : 1}).toArray(function(err, result) 
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
			else if (req.url === "/Signuppage")
			{
				sendFileContent(res, "signuppage.html", "text/html");
			}
			else if (req.url === "/loginpage")
			{
				sendFileContent(res, "loginpage.html", "text/html");
			}

			else if(req.url === "/")
			{
				console.log("Requested URL is url" + req.url);
				res.writeHead(200, 
				{
					'Content-Type': 'text/html'
				});
				res.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + req.url);
			}
			else if(/^\/[a-zA-Z0-9\/]*.js$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "text/javascript");
			}
			else if(/^\/[a-zA-Z0-9\/]*.css$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "text/css");
			}
			else if(/^\/[a-zA-Z0-9\/]*.jpg$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "image/jpg");
			}
			else
			{
				console.log("Requested URL is: " + req.url);
				res.end();
			}

		}
	});

	server.listen(7788);

	console.log("Server is runningAtime is" + new Date());


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
