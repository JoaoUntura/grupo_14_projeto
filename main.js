const {app, BrowserWindow} = require('electron')

function createWindow (){
    const win = new BrowserWindow({
        width:1366,
        height:768,
        webPreferences: {
            nodeIntegration: true,      
            contextIsolation: false      
          }
    })

    win.loadURL('http://localhost:4040')


}

app.whenReady().then(() => {
    require('./server/app')
    createWindow()
})



