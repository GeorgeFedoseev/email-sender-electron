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
        'https://www.googleapis.com/auth/calendar'
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
      } catch(err) {
        console.log(err.message + '\n');
      }
    })()
    

    /*authWindow.on('page-title-updated', function () {
      setImmediate(function () {
        const title = authWindow.getTitle();
        if (title.startsWith('Denied')) {
          reject(new Error(title.split(/[ =]/)[2]));
          authWindow.removeAllListeners('closed');
          authWindow.close();
        } else if (title.startsWith('Success')) {
          resolve(title.split(/[ =]/)[2]);
          authWindow.removeAllListeners('closed');
          authWindow.close();
        }
      });
    });
  
    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    // generate a url that asks permissions for Google+ and Google Calendar scopes 
    var scopes = [
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/calendar'
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token) 
        scope: scopes // If you only need one scope you can pass it as string 
    });
    
  
    authWindow.loadURL(url)
    authWindow.on('closed', function () {  
        authWindow = null
        reject(new Error('User closed  the window'));
    })  */
}





