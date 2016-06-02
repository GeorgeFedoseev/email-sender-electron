const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron');

var utils = require("./utils")

var https = require("https")
var najax = require("najax")

import google_auth from "./google_auth"

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// TODO: hide and reset this stuff
var CLIENT_ID = "1031179149187-427vb93q1pns28sqv1v8t13vb43p3j3c.apps.googleusercontent.com"; 
var CLIENT_SECRET = "qEL2jbVUaX4nk3LJc7HJyVlU";
var REDIRECT_URL = "urn:ietf:wg:oauth:2.0:oob";

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});


var Datastore = require('nedb'),
        db = new Datastore({ filename: './data.db', autoload: true });


let mainWindow = null

app.on('ready', onActivate)
app.on('window-all-closed', function () {  
  if (process.platform !== 'darwin') {
    app.quit()
  }    
})

app.on('activate', onActivate);


ipcMain.on("oauth_start", function(){
    createAuthWindow();
});


function onActivate(){     

    (async () => {
        if(await isOAuthFlowNeeded()){
            console.log("auth flow is needed");
            startAuthFlow();
        }else{
            console.log("all set")
            onAuthenticated();            
        }  
    })();
}

async function onAuthenticated(){
    console.log("onAuthenticated");
    if (mainWindow == null) {
        //createMainWindow();
    }   

    try{

    var token = await getTokenFromDB();
    console.log(token.access_token)

    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
          
    oauth2Client.setCredentials({
        access_token: token.access_token,
        refresh_token: token.refresh_token
    });

    
        listLabels(oauth2Client);    
    }catch(e){
        console.log(e)
    }
    
}



function createMainWindow () {
    console.log("create main win")
    mainWindow = new BrowserWindow({width: 800, height: 600})
    mainWindow.loadURL(`file://${__dirname}/windows/index.html`)
    mainWindow.webContents.toggleDevTools();

    mainWindow.on('closed', function () {  
        mainWindow = null
    });
}


function startAuthFlow () {  
    
    var scopes = [
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
    ];
    
    (async () => {
      try {
        const auth = google_auth({
          width: 450,
          height: 780,
          //titleBarStyle: "hidden-inset",
          resizable: false
        });
          
        var token = await auth.getAccessToken(scopes, CLIENT_ID, CLIENT_SECRET);
         // checkIfAccessTokenValid(token.access_token)
       // console.log(JSON.stringify(token, null, 2));
          
        // save token
        db.update({
            type: "config"                
        }, {
            $set: {
                token: token
            }
        }, {upsert: true}, function(err, numAffected){
            if(err){
                throw "Error when saving access token: "+err
            }            
            
            //mainWindow.send("auth-token-updated");
            
        });

        onAuthenticated();
          
       
          
      } catch(err) {
        console.log(err.message + '\n');
      }
    })()
   
}


async function isOAuthFlowNeeded(){
    
    var token = await getTokenFromDB()
    console.log("Check token: "+token.access_token);
    if(token != null){
        return false
    }else{
        console.log("token is null in db");
    }
    
    
    
    return true
}


function getTokenFromDB(){
    
    return new Promise((resolve, reject) => {
        db.find({type: "config"}, function(err, docs){
        
            if(err){
                throw err
            }

            if(docs.length > 1){
                throw "more than one config type doc in db"
            }

            if(docs.length == 0)
                resolve(null)        

            //console.log(docs[0]["token"])

            resolve(docs[0]["token"])
        })   
    })
    
}



/*async function checkIfAccessTokenValid(accessToken){        
    var resp = await utils.get_json("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+accessToken);
    if("error" in resp){
        return false
    }    

    return true;
}*/



function listLabels(auth) {    
    var gmail = google.gmail('v1');
    
    gmail.users.labels.list({
        auth: auth,
        userId: 'me',
    }, function(err, response) {
        if (err) {
          console.log("Error, try reauth");
          startAuthFlow();
          return;
        }
        
        var labels = response.labels;
        if (labels.length == 0) {
          console.log('No labels found.');
        } else {
          console.log('Labels:');
          for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            console.log('- %s', label.name);
          }
        }
    });
}




