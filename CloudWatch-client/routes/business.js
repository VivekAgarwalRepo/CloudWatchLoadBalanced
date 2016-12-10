var mysql1= require('./mysql');
var mq_client = require('../rpc/client');

exports.signin = function(req, res){
	console.log("Inside signin");
	var message="";
	res.render('business_signin', { title: 'Sign in', message:message});
};

exports.home = function(req, res){
	console.log("Inside home dashboard");
	res.render('business_dashboard', { title: 'Dashboard',first:req.session.first,last:req.session.last});
};

exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/business');
};

exports.analysis = function(req,res){
	console.log("Inside analysis");
	var flag=0;
	
	res.render('business_query',{title:'Analysis',first:req.session.first,last:req.session.last,flag:flag,message:"",display:""});

	};


exports.query = function(req,res){
	var q=req.param("query");
	console.log("Sensor query:"+q);
	var query= q;
	var arr=q.split(" ");
	if(arr[0]=="select")
	{
	mysql1.get(function(err,records){
		if(err){
			throw err;
		}
			else
				{
				var flag=1;
				var id=records[0].sensor_id;
				var name=records[0].sensor_name;
				var x=records[0].sensor_x;
				var y=records[0].sensor_y;
				var location=records[0].sensor_location;
				var active=records[0].sensor_active;
				console.log("active:"+active);
				var type=records[0].sensor_type;
				console.log("Inside else update");
				res.render('business_query_answers', { title: 'Analysis',rec:records,flag:flag,name:name,id:id,x:x,y:y,location:location,active:active,type:type,first:req.session.first,last:req.session.last});
			
				}
		
	},query);
}
	else
	{
		res.render('business_query', { title: 'Analysis',message: "Enter only SELECT query",display:"Tables present are sensor_register and testtable"});
	}

};

exports.dashboard = function(req, res){
	var username=req.param("username");
	var password=req.param("password");
	console.log(username);
	console.log(password);
	var first,message,last;
	var msg_payload = { "operation": "dashboard", "username": username, "password": password};
	mq_client.make_request('business_queue',msg_payload, function(err,records){
		if(err){
			throw err;
		}
		else 
		{
			if(records.code == 200){
				if(records.length<=0){
				  message="Email and Passwords do not match.";
				  console.log(message);
				  res.render('business_signin', { title: 'Sign in', message:message});
			  }
			else
				{
				
				first = records.first;
				last = records.last;
				req.session.first=first;
				req.session.last=last;
				console.log("last_name:"+last);
				res.render('business_dashboard', { title: 'Dashboard',first:first,last:last});
			
				}
			}
			else {
				console.log("Sorry could not fetch tweets");
			}
		}  
	});
};


exports.active = function(req, res){
	console.log("inside active");
	var sensor_name,latitude,longitude,sensor_location,timestamp,sensor_type;
	var flag="Yes";
	var msg_payload = { "operation": "active", "flag": flag};
	mq_client.make_request('business_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				res.render('business_active', { title: 'Active',first:req.session.first,last:req.session.last,rec:results.records});
			}
			else {
				console.log("Sorry could not fetch tweets");
			}
		}  
	});
};


exports.search = function(req, res){
	console.log("inside search");
	var search=req.param("search");
	var sensor_name,latitude,longitude,sensor_location,timestamp,sensor_type,active;
	var query= "SELECT * FROM sensor_register WHERE sensor_location like '%"+search+"%';";
	mysql1.get(function(err,records){
		if(err){
			throw err;
		}
			else
				{
				console.log("Inside else search");
				res.render('business_search', { title: 'Search',first:req.session.first,last:req.session.last,rec:records});
			
				}
		
	},query);

};

exports.validation= function (req,res) {

	res.render('business_validation');
};

exports.live=function (req,res) {
	var query="select live.timestamp,live.temperature, live.humidity, live.city from live,latestentry where live.timestamp=latestentry.latest order by timestamp asc;";

	mysql1.get(function (err,rows) {
		if(err){
			console.error(err)
		}
		else{
			res.send(rows);
		}
	},query);

}

exports.average=function (req,res) {
	var query="select *,((min+max)/2) as avg from citywise;";
	mysql1.get(function (err,rows) {
		if(err){
			console.error(err)
		}
		else{
			res.send(rows);
		}
	},query);
}

exports.avgHumid=function (req,res) {
	var query="select *,(minhumid+maxhumimd)/2 as avghumid from citywisehumid;";
	mysql1.get(function (err,rows) {
		if(err){
			console.error(err)
		}
		else{
			res.send(rows);
		}
	},query);
}

exports.bill=function (req,res) {
	query="Select * from business where username = '"+req.session.username+"';";

	mysql1.get(function (err,results) {
		console.log("Billing results :"+JSON.stringify(results));
		res.render('business_bill',{services:results[0]});
	},query);

}

exports.signup_page= function (req,res) {
	res.render('business_signup');
};

exports.business_check_validate= function (req,res) {


	console.log("req.param.dashboard"+req.param('dashboard'));
	console.log("req.param.dashboard"+req.param('active_sensors'));

	var dash=req.param('dashboard');
	var active=req.param('active_sensors');
	var extensive=req.param('extensive_analysis');
	var search=req.param('search_details');


	query="UPDATE business as set dashboard=?,actve_sensors=?,extensive_analysis=?,sensor_details=? where email=?"
	mysql1.add(function (err,result) {
		if(err){
			throw err;
		}
		else{
			res.redirect('/business_validation');
		}
	},query);

	res.redirect('/business_home');
};

exports.create= function (req,res) {
	res.render('business_create');
};
exports.location= function (req,res) {
	console.log("in business location");
	var msg_payload = { "operation": "location"};
	mq_client.make_request('business_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("results=");
				console.dir(results);
				res.render('business_location',{myresult:results.records});
			}
			else {
				console.log("Sorry could not fetch tweets");
			}
		}  
	});
};

exports.signup= function (req,res) {
	var username=req.param('username');
	var email=req.param('email');
	var password=req.param('password');
	var msg_payload = { "operation": "signup", "username": username, "email": email, "password": password};
	mq_client.make_request('business_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log(results);
				console.log("Tweets Fetched");
				res.redirect('/business_validation');
			}
			else {
				console.log("Sorry could not fetch tweets");
			}
		}  
	});
};

exports.createSensor = function(req,res)
{
	var sensor_name=req.param("sensor_name");
	var latitude=req.param("latitude");
	var longitude=req.param("longitude");
	var location=req.param("location");
	var active=req.param("active");
	var type=req.param("type");
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"
	                + (currentdate.getMonth()+1)  + "/" 
	                + currentdate.getFullYear() + " @ "  
	                + currentdate.getHours() + ":"  
	                + currentdate.getMinutes();

	    console.log("Timestamp:"+datetime);

	var xcoord="";
			var ycoord="";
			var options = {
		  provider: 'google',
		 
		  // Optional depending on the providers 
		  httpAdapter: 'https', // Default 
		  apiKey: 'AIzaSyB-7U6qTUfJE-_NBItfrn81VTRM3ZPrLKA', // for Mapquest, OpenCage, Google Premier 
		  formatter: null
		};
		 
		var geocoder = NodeGeocoder(options);
		 
		// Using callback 
		console.log("before googlemaps");
		geocoder.geocode(location, function(err, result) {
			if(err){
		console.log("in error googlemaps");
				throw err;
			}
			else{
		console.log("in googlemaps");
		  xcoord= result[0].latitude;
		  ycoord= result[0].longitude;
		  console.log("xcoord="+xcoord);
	var query= "insert into sensor_register (sensor_name,sensor_x,sensor_y,sensor_location,sensor_active,sensor_timestamp,sensor_type,city) VALUES ('"+sensor_name+"','"+xcoord+"','"+ycoord+"','"+location+"','"+active+"','"+datetime+"','"+type+"','"+req.param('city')+"');";
	mysql1.add(function(err,result){
		if(err){
			throw err;
		}
		else{
			console.log("Sensor Data Inserted.");
			res.render('/business_create');
		}
	},query);
}
});
};
