var fs, mkdirp;

fs = require('fs');

mkdirp = require('mkdirp');

// Public: a few utils for file-based auto-launching
module.exports = {
  /* Public */
  // This is essentially enabling auto-launching
  // options - {Object}
  //   :data - {String}
  //   :directory - {String}
  //   :filePath - {String}
  // Returns a Promise
  createFile: function({directory, filePath, data}) {
    return new Promise(function(resolve, reject) {
      return mkdirp(directory, function(mkdirErr) {
        if (mkdirErr != null) {
          return reject(mkdirErr);
        }
        return fs.writeFile(filePath, data, function(writeErr) {
          if (writeErr != null) {
            return reject(writeErr);
          }
          return resolve();
        });
      });
    });
  },
  // filePath - {String}
  isEnabled: function(filePath) {
    return new Promise((resolve, reject) => {
      return fs.stat(filePath, function(err, stat) {
        if (err != null) {
          return resolve(false);
        }
        return resolve(stat != null);
      });
    });
  },
  // This is essentially disabling auto-launching
  // filePath - {String}
  // Returns a Promise
  removeFile: function(filePath) {
    return new Promise((resolve, reject) => {
      return fs.stat(filePath, function(statErr) {
        if (statErr != null) {
          // If it doesn't exist, this is good so resolve
          return resolve();
        }
        return fs.unlink(filePath, function(unlinkErr) {
          if (unlinkErr != null) {
            return reject(unlinkErr);
          }
          return resolve();
        });
      });
    });
  }
};
