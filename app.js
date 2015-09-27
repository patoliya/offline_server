var express = require('express');
var app = express();
var file = require('easy-file');
var unirest = require('unirest');
var resbody;
var http = require("http");
var url = require('url');

var x_api_token = '9c90e1085f29434c96fd353a4696cb82';
var access_code = 'Bearer  974254fd68424c53aaf1e45431d765ab';

var port = process.env.PORT || 3000;

var meta ='<head> <meta name="txtweb-appkey" content="759d19ee-7d55-42b0-9fc3-d06a4d8bea17"/> </head>';
var body;



app.get('/',function (req,res){

	var queryObject = url.parse(req.url,true).query;
  	var msg = queryObject['txtweb-message'];
  	console.log(msg);
  	var keywords = msg.split(",");
  	var lat = keywords[0];
  	var lng = keywords[1];
  	var carType = keywords[2];
  	console.log(lat+' '+lng);

	var request = unirest("GET", "http://sandbox-t.olacabs.com/v1/bookings/create");

	request.query({
	  "pickup_lat": lat,
	  "pickup_lng": lng,
	  "pickup_mode": "NOW",
	  "category": carType
	});

	request.headers({
	  "authorization": access_code,
	  "x-app-token": x_api_token
	});

	request.end(function (response) {
	  if (response.error) throw new Error(response.error);
	  console.log("hele");
	  console.log(response.body);


	  if(response.body.status =='FAILURE'){
	    	body = '<body>Sorry NO CABS AVAILABLE</body>'
	  }else{

	  	var finaldata = "Driver name: "+response.body.driver_name+
	  					" Phone Number: "+response.body.driver_number+
	  					" Car: "+response.body.cab_type+
	  					" Cab model: "+response.body.carType+
	  					" Car number: "+response.body.cab_number+
	  					" Estimated time: "+response.body.eta+" minutes "
	  					" OrderId : "+response.body.crn;
		body = '<body>'+finaldata+'</body>';


		var userdata = { 'access_code': access_code ,'crn': response.body.crn};
		var donefile = file.write('data.txt', JSON.stringify(userdata));
		
      }
		res.send(meta+body);

	});


});



app.get('/cancel',function(req,res){



	file.read('data.txt', function(contents){
	  console.log(contents);
	  if(contents != " " ){
			  var contents = JSON.parse(contents);

			  console.log("heeh")

			  if(contents.access_code == access_code && contents.crn != null){
			  	console.log("inside contents")
			  	var crn = JSON.stringify(contents.crn);

			  	var request = unirest("GET", "http://sandbox-t.olacabs.com/v1/bookings/cancel");

			  	console.log("crn ki value "+ crn);
				request.query({
				  'crn': JSON.parse(crn)
				});

				request.headers({
				  "authorization": access_code,
				  "x-app-token": x_api_token
				});

				request.end(function (response) {
				  if (response.error) throw new Error(response.error);
				  console.log("cancel code");
				  console.log(response.body);

				  	if(response.body.status === 'SUCCESS'){

				  		var bodycancel = ' OLA CAB GOT CANCELLED ';
				  		var donefile = file.write('data.txt'," ");
						res.send(meta+bodycancel);
				  	}else{

				  		res.send(meta+" Cab is not cancelled Please call cab driver and cancel");
				  	}
					
			      });
					

				// 
			  }
		}else{

		res.send(meta+" Not cabs were booked for cancellation");
		}
	  });

	});






var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
