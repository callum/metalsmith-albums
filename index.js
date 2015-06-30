var path = require('path');
var async = require('async');
var exif = require('exif');
var jade = require('jade');
var xtend = require('xtend');

var FILETYPES = ['.jpg', '.jpeg', '.png', '.gif'];

function photo() {
  return function (files, metalsmith, done) {
    var template = jade.compileFile(path.join(__dirname, 'templates/album.jade'), { pretty: true });

    var manifests = Object.keys(files).filter(function (file) {
      return path.basename(file) === 'album.json';
    });

    var albums = manifests.map(function (manifest) {
      var dir = path.dirname(manifest);

      return function (done) {
        var photos = Object.keys(files)
        .filter(function (file) {
          return path.dirname(file) === dir &&
                 FILETYPES.indexOf(path.extname(file)) !== -1;
        })
        .map(function (file) {
          return function (done) {
            new exif.ExifImage({
              image: files[file].contents
            }, function (err, res) {
              done(err, xtend(res, {
                path: file,
                localPath: path.basename(file)
              }));
            });
          };
        });

        async.parallel(photos, function (err, photos) {
          var album = xtend({
            path: dir,
            photos: photos
          }, JSON.parse(files[manifest].contents.toString()));

          files[path.join(dir, 'index.html')] = {
            contents: new Buffer(template(album))
          };

          done(err, album);
        });
      };
    });

    async.parallel(albums, function (err, albums) {
      manifests.forEach(function (manifest) {
        delete files[manifest];
      });

      metalsmith.metadata({ albums: albums });

      done(err, albums);
    });
  };
}

module.exports = photo;
