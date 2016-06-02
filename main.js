const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron');


import google_auth from "./google_auth"



var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = "1031179149187-427vb93q1pns28sqv1v8t13vb43p3j3c.apps.googleusercontent.com";
var CLIENT_SECRET = "qEL2jbVUaX4nk3LJc7HJyVlU";
var REDIRECT_URL = "urn:ietf:wg:oauth:2.0:oob";

let mainWindow

app.on('ready', createMainWindow)
app.on('window-all-closed', function () {  
  if (process.platform !== 'darwin') {
    app.quit()
  }    
})

app.on('activate', function () {  
  if (mainWindow === null) {
    createMainWindow()    
  }    
})

ipcMain.on("oauth_start", function(){
    createAuthWindow();
});


function createMainWindow () {
    console.log("create main win")
    mainWindow = new BrowserWindow({width: 800, height: 600})
    mainWindow.loadURL(`file://${__dirname}/windows/index.html`)
    mainWindow.webContents.toggleDevTools();

    mainWindow.on('closed', function () {  
    mainWindow = null
  })  
}


function createAuthWindow () {  
    
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
        console.log(JSON.stringify(token, null, 2));
          
        var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
          
        oauth2Client.setCredentials({
          access_token: token.access_token,
          refresh_token: token.refresh_token
        });
          
        listLabels(oauth2Client);
          
      } catch(err) {
        console.log(err.message + '\n');
      }
    })()
   
}


function listLabels(token) {
    var gmail = google.gmail('v1');
    
    gmail.users.labels.list({
        auth: token,
        userId: 'me',
    }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
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




