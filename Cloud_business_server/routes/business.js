var mysql1= require('./mysql');

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


exports.query = function(msg,callback){
	var q= msg.query;
	var res = {};
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
				res.flag=1;
				res.id=records[0].sensor_id;
				res.name=records[0].sensor_name;
				res.x=records[0].sensor_x;
				res.y=records[0].sensor_y;
				res.location=records[0].sensor_location;
				res.active=records[0].sensor_active;
				console.log("active:"+res.active);
				res.type=records[0].sensor_type;
				console.log("Inside else update");
				
				}
				callback(null, res);
	},query);
}

	};

exports.dashboard = function(msg, callback){
	var res={};
	console.log(msg);
	var username=msg.username;
	var password=msg.password;
	console.log(username);
	console.log(password);
	var first,message,last;
	var query= "SELECT * FROM business WHERE username='"+username+"' and password='"+password+"';";
	mysql1.get(function(err,records){
		if(err){
			throw err;
		}
		else{
			if(records.length<=0){
				  res.message="Email and Passwords do not match.";
				  console.log(res.message);
			  }
			else
				{
					console.log(records[0].username);
					// console.log(records);
				res.code = "200";
				res.first = records[0].username;
				res.last = records[0].email;
				console.log("last_name:"+res.last);
				
				}
				callback(null, res);
		}
	},query);
};


exports.active = function(msg, callback){
	var res={};
	console.log("inside active");
	var sensor_name,latitude,longitude,sensor_location,timestamp,sensor_type;
	var flag="Yes";
	var query= "SELECT * FROM sensor_register WHERE sensor_active='"+flag+"';";
	mysql1.get(function(err,records){
		if(err){
			throw err;
		}
			else
				{
				console.log("Inside else active");
				//res.render('business_active', { title: 'Active',first:req.session.first,last:req.session.last,rec:records});
				res.code="200";
				res.records = records;
				}
				callback(null, res);
	},query);

};


exports.search = function(msg, callback){
	var res = {};
	console.log("inside search");
	var search=msg.search;
	var sensor_name,latitude,longitude,sensor_location,timestamp,sensor_type,active;
	var query= "SELECT * FROM sensor_register WHERE sensor_location like '%"+search+"%';";
	mysql1.get(function(err,records){
		if(err){
			throw err;
		}
			else
				{
				console.log("Inside else search");
				//res.render('business_search', { title: 'Search',first:req.session.first,last:req.session.last,rec:records});
				res.code="200";
				res.records = records;
				}
				callback(null, res);
	},query);

};

exports.validation= function (req,res) {

	res.render('business_validation');
};

exports.location= function (msg,callback) {
	var res={};
	console.log("in business location");
	var get_sensor= "Select * from sensor_register;";
	mysql1.get(function (err, records) {

		console.log("records=");
		console.dir(records[0]);
		res.code="200";
		res.records = records;
		callback(null, res);
		//res.render('business_location',{myresult:records});
	},get_sensor);
};

exports.signup= function (msg,callback) {
	var res={};
	var username=msg.username;
	var email=msg.email;
	var password=msg.password;
	console.log("inside signup");
	var create_business= "INSERT INTO business (username,email,password,dashboard,actve_sensors,extensive_analysis,sensor_details) VALUES ('"+username+"','"+email+"','"+password+"','0','0','0','0');";
	mysql1.add(function (err,result) {
		if(err){
			throw err;
		}
		else{
			// res.redirect('/business_validation');
			res.code="200";
			}
			callback(null, res);
	},create_business);
};

exports.signup_page= function (req,res) {
	
	res.render('business_signup');
};

exports.business_check_validate= function (req,res) {
	
	console.log("req.param.dashboard"+req.param('dashboard'));
	console.log("req.param.dashboard"+req.param('active_sensors'));
	res.redirect('/business_home');
};

exports.create= function (req,res) {
	res.render('business_create');
};
