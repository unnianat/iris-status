'use strict';

const express = require('express');
const service = express();
const request = require('superagent');

require('dotenv').config({path: '../.env'});

service.get('/service/:location', (req, res, next) => {
	var temp = "hello";
	var tktnum=req.params.location;
	var assignee;
	if( tktnum.startsWith('INC') )    
	{
		//res.json({result: `Unnikrishnan Kavungal Anat`});
		

var auth = new Buffer( process.env.SERVICE_NOW_USER + ':' + process.env.SERVICE_NOW_PASSWORD).toString('base64'); //create --user user:password to add to header

request.get(process.env.SERVICE_NOW_URL+'?number='+tktnum)
	.set('Authorization','Basic ' + auth) //adding authentication
	
	.end(function(err, ress){
		if(err) {
            console.log(err);

            return ress.sendStatus(500);
			
        }else{
			console.log(ress.body.result);
			
			//temp = ress.body.result.number;
			//console.log("RR " +temp);

			switch(ress.body.result[0].state) {
    case '7':
        res.json({result: `Your ticket ${tktnum} has been closed with the close note:"${ress.body.result[0].close_notes}"`}); 
        break;
    case '1':
         res.json({result: `Your ticket ${tktnum} has not been assigned to anyone yet. Please check back later.`}); 
        break;
	case '2':
	console.log("Case 2");
	request.get(ress.body.result[0].assigned_to.link)
	.set('Authorization','Basic ' + auth) 
	.end(function(erruser, ressuser){
		assignee=ressuser.body.result.name;  

	});
	
	request.get('https://dev19633.service-now.com/api/now/table/sys_journal_field?sysparm_query=element_id='+ress.body.result[0].sys_id+'^ORDERBYDESCsys_created_on')
	.set('Authorization','Basic ' + auth) 
	.end(function(errcomment, rescomment){
		res.json({result: `Your ticket ${tktnum} has been assigend to ${assignee}. The last comment on the ticket is: ${rescomment.body.result[0].value}.`});  

	});


    break;
	case 'default':
	res.json({result: `Sorry, i am having troubel finding the status of your ticket.`});  

}




			
		}
    });

	
	}
	else
	{
		res.json({result: `Sorry, ${tktnum} deosnt look like a service now ticket number. Are you sure this is the correct ticket number.`});	
	}
	


});

module.exports = service;