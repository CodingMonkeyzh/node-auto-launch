var applescript, fileBasedUtilities, untildify,
  indexOf = [].indexOf;

applescript = require('applescript');

untildify = require('untildify');

fileBasedUtilities = require('./fileBasedUtilities');

module.exports = {
  /* Public */
  // options - {Object}
  //   :appName - {String}
  //   :appPath - {String}
  //   :isHiddenOnLaunch - {Boolean}
  //   :mac - (Optional) {Object}
  //       :useLaunchAgent - (Optional) {Boolean}
  // Returns a Promise
  enable: function({appName, appPath, isHiddenOnLaunch, mac}) {
    var data, isHiddenValue, programArguments, programArgumentsSection, properties;
    // Add the file if we're using a Launch Agent
    if (mac.useLaunchAgent) {
      programArguments = [appPath];
      if (isHiddenOnLaunch) {
        programArguments.push('--hidden');
      }
      programArgumentsSection = programArguments.map(function(argument) {
        return `    <string>${argument}</string>`;
      }).join('\n');
      data = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${appName}</string>
  <key>ProgramArguments</key>
  <array>
  ${programArgumentsSection}
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>`;
      return fileBasedUtilities.createFile({
        data,
        directory: this.getDirectory(),
        filePath: this.getFilePath(appName)
      });
    }
    // Otherwise, use default method; use AppleScript to tell System Events to add a Login Item
    isHiddenValue = isHiddenOnLaunch ? 'true' : 'false';
    properties = `{path:\"${appPath}\", hidden:${isHiddenValue}, name:\"${appName}\"}`;
    return this.execApplescriptCommand(`make login item at end with properties ${properties}`);
  },
  // appName - {String}
  // mac - {Object}
  //   :useLaunchAgent - {Object}
  // Returns a Promise
  disable: function(appName, mac) {
    if (mac.useLaunchAgent) {
      // Delete the file if we're using a Launch Agent
      return fileBasedUtilities.removeFile(this.getFilePath(appName));
    }
    // Otherwise remove the Login Item
    return this.execApplescriptCommand(`delete login item \"${appName}\"`);
  },
  // appName - {String}
  // mac - {Object}
  //   :useLaunchAgent - {Object}
  // Returns a Promise which resolves to a {Boolean}
  isEnabled: function(appName, mac) {
    if (mac.useLaunchAgent) {
      // Check if the Launch Agent file exists
      return fileBasedUtilities.isEnabled(this.getFilePath(appName));
    }
    // Otherwise check if a Login Item exists for our app
    return this.execApplescriptCommand('get the name of every login item').then(function(loginItems) {
      return (loginItems != null) && indexOf.call(loginItems, appName) >= 0;
    });
  },
  /* Private */
  // commandSuffix - {String}
  // Returns a Promise
  execApplescriptCommand: function(commandSuffix) {
    return new Promise(function(resolve, reject) {
      return applescript.execString(`tell application \"System Events\" to ${commandSuffix}`, function(err, result) {
        if (err != null) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  },
  // Returns a {String}
  getDirectory: function() {
    return untildify('~/Library/LaunchAgents/');
  },
  // appName - {String}
  // Returns a {String}
  getFilePath: function(appName) {
    return `${this.getDirectory()}${appName}.plist`;
  }
};
