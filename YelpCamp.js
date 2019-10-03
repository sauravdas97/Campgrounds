// ============== Modules ==============
var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + "/public"));

var methodOverride = require("method-override");
app.use(methodOverride("_method"))

var flash = require("connect-flash");
app.use(flash());

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/yelpcamp");
var Campground = require("./models/mongo_schema.js");
var Comment = require("./models/comments.js")

var seed = require("./seeds.js");
seed();
// =====================================================

// ======================= PASSPORT SETUP =======================
var passport = require("passport")
var localStrategy = require("passport-local")
var User = require("./models/user.js")
app.use(require("express-session")({
  secret: "This is express session",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ========================================================

// ====================================================
//                        ROUTES
// ====================================================

app.get("/",function(req,res){
  res.render("home.ejs", {currentUser:req.user,message:req.flash("success")});
})

app.get("/campgrounds",function(req,res){
  Campground.find({},function(err,campground){
    if(err){
      console.log(err);
    }else{
      res.render("campgrounds.ejs",{camp:campground, currentUser:req.user, message:req.flash("loggedin")})
    }
  })

  })

app.post("/campgrounds",function(req,res){
  var new_name= req.body.camp_name;
  var new_image=req.body.camp_image;
  var new_desc = req.body.description;
  var newCampground ={name:new_name,image:new_image,description:new_desc};
  Campground.create(newCampground,function(err,newly_added){
    if(err){
      console.log(errr);
    }else {
      console.log(newly_added);
      res.redirect("/campgrounds");
    }
  })
})

app.get("/campgrounds/new",isLoggedIn,function(req,res){
  res.render("campgrounds-new.ejs",{currentUser:req.user,message:req.flash("error")})
})

app.get("/campgrounds/:id",function(req,res){
  id=req.params.id;
  Campground.findById(id).populate("comments").exec(function(err,foundCampground){
    if(err){
      console.log(err);
    }else{
      res.render("show_details.ejs",{camps:foundCampground, currentUser:req.user,message:req.flash("error")})
    }
  })
})

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
  postedComment = {text:req.body.text, author:req.body.author}
  Campground.findById(req.params.id,function(err,found){
    if(err){
      console.log(err);
    }else{
      Comment.create(postedComment,function(err,newComment){
        if(err){
          console.log(err);
        }else{
          found.comments.push(newComment)
          found.save()
          res.redirect("/campgrounds/"+req.params.id)
        }
      })
    }
  })
})

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
  Campground.findById(req.params.id,function(err,found){
    if(err){
      console.log(err);
    }else{
      res.render("new_comments.ejs",{campground:found,currentUser:req.user,message:req.flash("error")});
    }
  })
})

app.delete("/campgrounds/:id/comments/:comments_id",function(req,res){
  Comment.findByIdAndRemove(req.params.comments_id,function(err){
    if(err){
      console.log(err);
      res.redirect("/campgrounds/"+req.params.id);
    }else{
      res.redirect("/campgrounds/"+req.params.id);
    }
  });
});

// --------------------------------------------
// AUTH ROUTES
// --------------------------------------------

app.get("/register",function(req,res){
  res.render("register.ejs",{currentUser:req.user,message:req.flash("error")})
})

app.post("/register",function(req,res){
  User.register(new User({username: req.body.username}),req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/campgrounds")
      })
    }
  })
})

app.get("/login",function(req,res){
  res.render("login.ejs",{currentUser:req.user, message:req.flash("error")});
})

app.post("/login",passport.authenticate("local",{
  successRedirect: "/campgrounds",
  failureRedirect: "/login"
}),function(req,res){
  req.flash("loggedin","You have logged in!")
});

app.get("/logout",function(req,res){
  req.logout();
  req.flash("success","logged out");
  res.redirect("/");
})

app.get("/campgrounds/:id/edit",isLoggedIn,function(req,res){
  Campground.findById(req.params.id,function(err,found){
    if(err){
      console.log(err);
    }else{
      res.render("edit.ejs",{camps:found,currentUser:req.user});
    }
  })
});

app.put("/campgrounds/:id",isLoggedIn,function(req,res){
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err,found){
    if(err){
      console.log(err);
    }else{
      res.redirect("/campgrounds")
    }
  });
});

app.delete("/campgrounds/:id",isLoggedIn,function(req,res){
  Campground.findByIdAndRemove(req.params.id,function(err){
    if(err){
      res.redirect("/campgrounds")
      console.log(err);
    }else{
      res.redirect("/campgrounds")
    }
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error","Please log in");
  res.redirect("/login");
}

app.listen(2000,function(){
  console.log("YelpCamp has started at port 2000");
})
