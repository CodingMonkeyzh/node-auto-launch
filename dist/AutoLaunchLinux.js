var fileBasedUtilities, untildify;

untildify = require('untildify');

fileBasedUtilities = require('./fileBasedUtilities');

module.exports = {
  /* Public */
  // options - {Object}
  //   :appName - {String}
  //   :appPath - {String}
  //   :isHiddenOnLaunch - {Boolean}
  // Returns a Promise
  enable: function({appName, appPath, isHiddenOnLaunch}) {
    var data, hiddenArg;
    hiddenArg = isHiddenOnLaunch ? ' --hidden' : '';
    data = `[Desktop Entry]
Type=Application
Version=1.0
Name=${appName}
Comment=${appName}startup script
Exec=${appPath}${hiddenArg}
StartupNotify=false
Terminal=false`;
    return fileBasedUtilities.createFile({
      data,
      directory: this.getDirectory(),
      filePath: this.getFilePath(appName)
    });
  },
  // appName - {String}
  // Returns a Promise
  disable: function(appName) {
    return fileBasedUtilities.removeFile(this.getFilePath(appName));
  },
  // appName - {String}
  // Returns a Promise which resolves to a {Boolean}
  isEnabled: function(appName) {
    return fileBasedUtilities.isEnabled(this.getFilePath(appName));
  },
  /* Private */
  // Returns a {String}
  getDirectory: function() {
    return untildify('~/.config/autostart/');
  },
  // appName - {String}
  // Returns a {String}
  getFilePath: function(appName) {
    return `${this.getDirectory()}${appName}.desktop`;
  }
};
