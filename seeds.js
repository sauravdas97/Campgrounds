var mongoose = require("mongoose")
var Campground = require("./models/mongo_schema.js")
var Comment = require("./models/comments.js")

var camp_data = [
  {
    name:"Kedarnath",
    image:"https://www.tourmyindia.com/chardham/images/kedarnath-dham1.jpg",
    description:"Beautiful"
  },
  {
    name:"Sundarban",
    image:"https://static1.squarespace.com/static/54d438dee4b01676a025f916/t/5aa73f2f419202c439e89e94/1520910139556/Sundarbans+Mangrove+Tunnel6795.jpg",
    description:"Nice"

  },
  {
    name:"Kovalam",
    image:"https://upload.wikimedia.org/wikipedia/commons/0/0e/01KovalamBeach%26Kerala.jpg",
    description:"Awesome"
  }
]

// ----------------- REMOVE CAPMGROUNDS WHILE PAGE LOADS -----------------
function seedDB(){
  Campground.remove({},function(err){
    if(err){
      console.log(err);
    }else{
      console.log("removed campgrounds");
    }
  });


  for(var i=0;i<camp_data.length;i++)
  {
    n = camp_data[i].name
    img = camp_data[i].image
    desc = camp_data[i].description
    data = {name:n, image:img, description:desc}

    Campground.create(data,function(err,campground){
      if(err){
      console.log(err);
      }else{
        console.log("created")

        Comment.create(
          {
            text:"This is one of my favourite places",
            author: "Rick"
          } , function(err,comment){
            if(err){
              console.log(err);
            }else{
              campground.comments.push(comment);
              campground.save();
              console.log("created new comment");
            }
          });
      }
    });
  }
}
module.exports = seedDB;
// -----------------------------------------------------------------------
