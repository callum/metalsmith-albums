var path = require('path');
var metalsmith = require('metalsmith');
var test = require('tape');
var photo = require('../');

var fixtures = path.join(__dirname, 'fixtures');

test('collects metadata', function (t) {
  metalsmith(fixtures)
  .use(photo())
  .use(function (files, metalsmith) {
    var album = metalsmith.metadata().albums[0];
    var photo = album.photos[0];

    t.equal(album.path, '.');
    t.equal(album.name, 'Foo');
    t.equal(photo.path, 'IMG_8313.jpg');
  })
  .build(function (err) {
    t.end(err);
  });
});

test('creating an album index', function (t) {
  metalsmith(fixtures)
  .use(photo())
  .use(function (files, metalsmith) {
    t.ok(files['index.html']);
  })
  .build(function (err) {
    t.end(err);
  });
});
