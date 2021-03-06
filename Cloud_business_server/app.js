
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, session = require('express-session');
var path = require('path');
var admin = require('./routes/admin');
var business = require('./routes/business');
var amqp = require('amqp')
, util = require('util');


//Sample
var app = express();

//all environments

// app.set('port', process.env.PORT || 3002);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({cookieName: 'session', secret: "fafadsfasfgfsgsa", resave: false, saveUninitialized: true,
    duration: 30 * 60 * 1000, activeDuration: 5 * 60 * 1000}));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });
app.use(session({
	secret: 'cmpe281_teststring',
	resave: false,  //don't save session if unmodified
	saveUninitialized: true,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000
}));

app.use(app.router);


//development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

//GET Requests

app.get('/', function (req,res) {
	res.render('home');
});

app.get('/admin',admin.signin);
app.post('/dashboard',admin.dashboard);
app.get('/home',admin.home);
app.get('/logout',admin.logout);
app.post('/createSensor',admin.createSensor);
app.get('/active',admin.active);
app.post('/search',admin.search);
// app.get('/fill',admin.enterVals);
app.get('/location',admin.location);
app.get('/analysis',admin.analysis);
app.post('/query',admin.query);
app.get('/delete_sensor',admin.delete_sensor);
app.get('/update_sensor',admin.update_sensor);
app.post('/update_sen',admin.update_sen);
// nayan start
app.get('/getweather',user.getweather);
app.get('/getweatherbyloc',user.getweatherbyloc);
app.get('/setcurrentlocation',user.setcurrentlocation);
app.get('/showweather',user.showweather);
app.get('/users', user.list);



// app.get('/business',business.signin);
// app.get('/business_home', business.home);
// app.get('/business_validation',business.validation);
// app.get('/business_logout',business.logout);
// app.get('/business_analysis',business.analysis); 
// app.get('/business_signup_page',business.signup_page);
// app.post('/business_check_validate',business.business_check_validate);
// app.get('/business_create',business.create);

var cnn = amqp.createConnection({ host: "localhost", port: 5672 });

cnn.on('ready', function(){
	console.log("listening on business_queue");
	cnn.queue('business_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			if(message.operation == "dashboard")
				{
				console.log("business_dashboard");
				business.dashboard(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
				else if(message.operation == "active")
				{
				console.log("business_active");
				business.active(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
				else if(message.operation == "search")
				{
				console.log("business_search");
				business.search(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
				else if(message.operation == "location")
				{
				console.log("business_location");
				business.location(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
				else if(message.operation == "query")
				{
				console.log("business_query");
				business.query(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
				else if(message.operation == "signup")
				{
				console.log("business_signup");
				business.signup(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			
			});
				}
				else
				{

				}
			});
			});
			});



	// http.createServer(app).listen(app.get('port'), function(){
	// 	console.log('Express server listening on port ' + app.get('port'));
	// });  
