"use strict";
require('dotenv').config();

const express       = require('express'),
      app           = express(),
      bodyParser    = require('body-parser'),
      request       = require('request');
      
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Setting Up HTTP request details for Zomato Api


// ---------------------------------------------------------
app.get("/", (req,res) => {
  res.send('<h1>Hello!<h1><br /><a href="/restaurants">Restraunt Page</a>');
});


app.get("/restaurants", (req,res) => {
  console.log(req.query);
  let data        = {},
      parsedData  = {  "messages": [
                        {
                          "attachment": {
                            "type": "template",
                            "payload": {
                              "template_type": "generic",
                              "image_aspect_ratio": "square",
                              "elements": [
                              ]
                            }
                          }
                        }
                      ]
                    };
      
      
      
  const longitude = Number(req.query.lon),
        latitude  = Number(req.query.lat);
  console.log(longitude, latitude);
  
  
  const options = {
    url: `https://developers.zomato.com/api/v2.1/geocode?lat=${latitude}&lon=${longitude}`,
    headers: {
      'user-key': process.env.USER_API_KEY
    },
    json: true
  };
  
  
  request(options ,(error,response,body) => {
    if(!error && response.statusCode==200){
      // data = JSON.parse(body);   //not needed as json: true passed with header.
      
      body.nearby_restaurants.forEach(place => {
        // console.log(place.restaurant)
        parsedData.messages[0].attachment.payload.elements.push({
                                  "title": `${place.restaurant.name} ( Rating:${place.restaurant.user_rating.aggregate_rating} )`,
                                  "image_url": place.restaurant.thumb,
                                  "subtitle": "Cuisines: "+place.restaurant.cuisines,
                                  "buttons": [
                                    {
                                      "type": "web_url",
                                      "url": place.restaurant.url,
                                      "title": "View Item"
                                    }
                                  ]
                                });
      });
      
      console.log(parsedData.messages[0].attachment.payload.elements[0]);
      res.json(parsedData);
    }else{
      throw error;
    }
  });
});



app.listen(process.env.PORT, process.env.IP, () => {
  console.log("Chat server listening at", process.env.IP + ":" + process.env.PORT);
});
