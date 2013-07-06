
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , BookProvider = require('./bookprovider').BookProvider;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var bookProvider = new BookProvider('localhost', 27017);

//Routes
app.get('/', function(req, res){
    bookProvider.findAll(function(error, books) {
      res.render('index', {
        title: 'Books',
        books: books
      });
    });
});

app.get('/book/new', function(req, res) {
  res.render('book_new', {
    title: "New Book"
  });
});

//save new book
app.post('/book/new', function(req, res) {
  bookProvider.save({
    title: req.param('title'),
    author: req.param('author')
  }, function(error, docs) {
    res.redirect('/');
  });
});

//update a book
app.get('/book/:id/edit', function(req, res) {
  bookProvider.findById(req.param('_id'), function(error, book) {
    res.render('book_edit',
      { title: book.title,
        book: book
      });
  });
});

//save updated book
app.post('/book/:id/edit', function(req, res){
  bookProvider.update(req.param('_id'),{
    title: req.param('title'),
    author: req.param('author'),
    date_finished: req.param('date_finished'),
    thoughts: req.param('thoughts')
  }, function(error, docs) {
    res.redirect('/');
  });
});

//delete a book
app.post('/book/:id/delete',function(req, res) {
  bookProvider.delete(req.param('_id'), function(error, docs){
    res.redirect("/");
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
