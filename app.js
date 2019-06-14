var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var noteM = require('./note')
var jsonToXml = require('jsontoxml');
var xmlparser = require('express-xml-bodyparser');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(xmlparser());

var parser = require('fast-xml-parser');
var he = require('he');
var options = {
  attributeNamePrefix : "@_",
  attrNodeName: "attr", //default is 'false'
  textNodeName : "#text",
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
  tagValueProcessor : a => he.decode(a) //default is a=>a
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

//API
app.get('/notes', function(req, res, next)
{
  var accept = req.get('Accept');
  console.log(accept + req.accepts('application/xml'));
  var note = noteM.getAllNotes();
  switch (accept) {
    case 'application/xml':
      res.send(jsonToXml(note, standalone="yes"));    
      break;  
    default:
        res.send(note);
      break;
  }  
});

app.post('/notes', function(req, res, next)
{
  var title, body;
  console.log(req.body);
  if (req.is('application/xml'))
  {    
    //var jsonObj = parser.parse(req.body); //, options
    title = req.body.note.title[0];
    body = req.body.note.body[0];
  }
  else
  {
    title = req.body.title;
    body = req.body.body;
  }
    
    console.log(title + ' ' + body);
    var note = noteM.createNote(title, body);
    if (note)
    {
      var accept = req.get('Accept');
      switch (accept) {
        case 'application/xml':
            res.status(201).send(jsonToXml(note));    
          break;  
        default:
            res.status(201).send(note);
          break;
      }               
    }
    else {
      res.status(500).send('Note not created!');
    }
});

app.delete('/notes', function(req, res, next)
{
  var title, body;
  console.log(req.body);
  if (req.is('application/xml'))
  {    
    //var jsonObj = parser.parse(req.body); //, options
    title = req.body.note.title[0];
    //body = req.body.note.body;
  }
  else
  {
    title = req.body.title;
    //body = req.body.body;
  }
  var result = noteM.deleteNote(title);
  if (result)
  {
    res.status(204).send('Note deleted');
  }
  else
  {
    res.status(404).send('Note not found!');
  }
  
});

app.put('/notes', function(req, res, next)
{
  var title, body;
  console.log(req.body);
  if (req.is('application/xml'))
  {    
    //var jsonObj = parser.parse(req.body); //, options
    title = req.body.note.title[0];
    body = req.body.note.body[0];
  }
  else
  {
    title = req.body.title;
    body = req.body.body;
  }
  //var accept = req.get('Accept');
  var note = noteM.updateNote(title, body);
  if (note)
    {
      var accept = req.get('Accept');
      switch (accept) {
        case 'application/xml':
            res.status(204).send(jsonToXml(note));    
          break;  
        default:
            res.status(204).send(note);
          break;
      }        
    }
    else {
        res.status(404).send('Note not found!');
    }
  
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
