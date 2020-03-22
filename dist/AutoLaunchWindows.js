var Winreg, fs, path, regKey;

fs = require('fs');

path = require('path');

Winreg = require('winreg');

regKey = new Winreg({
  hive: process.arch === 'x64' ? Winreg.HKLM : Winreg.HKCU,
  key: process.arch === 'x64' ? '\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Run' : '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

module.exports = {
  /* Public */
  // options - {Object}
  //   :appName - {String}
  //   :appPath - {String}
  //   :isHiddenOnLaunch - {Boolean}
  // Returns a Promise
  enable: function({appName, appPath, isHiddenOnLaunch}) {
    return new Promise(function(resolve, reject) {
      var args, pathToAutoLaunchedApp, ref, updateDotExe;
      pathToAutoLaunchedApp = appPath;
      args = '';
      updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe');
      // If they're using Electron and Squirrel.Windows, point to its Update.exe instead
      // Otherwise, we'll auto-launch an old version after the app has updated
      if ((((ref = process.versions) != null ? ref.electron : void 0) != null) && fs.existsSync(updateDotExe)) {
        pathToAutoLaunchedApp = updateDotExe;
        args = ` --processStart \"${path.basename(process.execPath)}\"`;
        if (isHiddenOnLaunch) {
          args += ' --process-start-args "--hidden"';
        }
      } else {
        if (isHiddenOnLaunch) {
          args += ' --hidden';
        }
      }
      return regKey.set(appName, Winreg.REG_SZ, `\"${pathToAutoLaunchedApp}\"${args}`, function(err) {
        if (err != null) {
          return reject(err);
        }
        return resolve();
      });
    });
  },
  // appName - {String}
  // Returns a Promise
  disable: function(appName) {
    return new Promise(function(resolve, reject) {
      return regKey.remove(appName, function(err) {
        if (err != null) {
          // The registry key should exist but in case it fails because it doesn't exist, resolve false instead
          // rejecting with an error
          if (err.message.indexOf('The system was unable to find the specified registry key or value') !== -1) {
            return resolve(false);
          }
          return reject(err);
        }
        return resolve();
      });
    });
  },
  // appName - {String}
  // Returns a Promise which resolves to a {Boolean}
  isEnabled: function(appName) {
    return new Promise(function(resolve, reject) {
      return regKey.get(appName, function(err, item) {
        if (err != null) {
          return resolve(false);
        }
        return resolve(item != null);
      });
    });
  }
};
