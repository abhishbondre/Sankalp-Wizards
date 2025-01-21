const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");
const MONGO_URL = "mongodb://127.0.0.1:27017/placement-database";
const mongoose = require("mongoose");
const models = require("./models");
const { Student, TPO, UserAuth, Opportunity, Event } = models;
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.set("debug", false);

mongoose
  .connect(MONGO_URL, {
    autoIndex: true,
  })
  .then(() => {
    console.log("Connected to database");
    mongoose.connection.collections.students
      ?.dropIndex("collegeId_1")
      .catch((err) => {
        if (err.code !== 27) {
          console.error("Error dropping index:", err);
        }
      });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });

// Inmemory storage
const db = {
  students: new Map(),
  tpo: null,
  events: new Map(),
  opportunities: new Map(),
};

let currentUser = null;

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!currentUser) {
    return res.redirect("/login?error=Please login to continue");
  }
  next();
};

// Role-based middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (currentUser?.type !== role) {
      return res.status(403).render("error", {
        layout: "layouts/auth-boilerplate",
        title: "Access Denied",
        message: "You don't have permission to access this resource",
        backUrl: "/",
        cssFile: "error.css",
      });
    }
    next();
  };
};

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  if (currentUser) {
    return res.redirect(
      currentUser.type === "student" ? "/student-dashboard" : "/tpo-dashboard"
    );
  }

  res.render("pages/login", {
    layout: "layouts/auth-boilerplate",
    title: "Login",
    error: req.query.error || "",
    cssFile: "login.css",
    jsFile: "login.js",
  });
});

app.get("/register", (req, res) => {
  if (currentUser) {
    return res.redirect(
      currentUser.type === "student" ? "/student-dashboard" : "/tpo-dashboard"
    );
  }

  res.render("pages/register", {
    layout: "layouts/auth-boilerplate",
    title: "Register",
    error: "",
    cssFile: "login.css",
    jsFile: "register.js",
  });
});

app.post(
  "/register",
  wrapAsync(async (req, res) => {
    const { userType, fullName, email, password } = req.body;

    if (!fullName || !email || !password || !userType) {
      throw new ExpressError(400, "All fields are required");
    }

    const existingUser = await UserAuth.findOne({ email });
    if (existingUser) {
      throw new ExpressError(400, "Email already registered");
    }

    const userAuth = new UserAuth({
      email,
      password,
      userType,
      name: fullName,
    });

    let profile;
    try {
      if (userType === "student") {
        profile = new Student({
          user: userAuth._id,
          isProfileComplete: false,
        });
      } else {
        profile = new TPO({
          user: userAuth._id,
          isProfileComplete: false,
        });
      }

      await profile.save();
      userAuth.profile = profile._id;
      await userAuth.save();

      res.json({
        success: true,
        message: "Registration successful! Please login to continue.",
      });
    } catch (error) {
      if (profile?._id) {
        await (userType === "student" ? Student : TPO).findByIdAndDelete(
          profile._id
        );
      }
      if (userAuth?._id) {
        await UserAuth.findByIdAndDelete(userAuth._id);
      }
      throw error;
    }
  })
);

app.post(
  "/login",
  wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ExpressError(400, "Email and password are required");
    }

    const user = await UserAuth.findOne({ email });
    if (!user) {
      throw new ExpressError(401, "Invalid credentials");
    }

    const populatedUser = await UserAuth.findById(user._id).populate({
      path: "profile",
      model: user.userType === "student" ? Student : TPO,
    });

    if (!populatedUser || populatedUser.password !== password) {
      throw new ExpressError(401, "Invalid credentials");
    }

    currentUser = {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      type: populatedUser.userType,
      profile: populatedUser.profile,
      isProfileComplete: populatedUser.profile?.isProfileComplete || false,
    };

    res.json({
      success: true,
      redirect:
        populatedUser.userType === "student"
          ? "/student-dashboard"
          : "/tpo-dashboard",
    });
  })
);

app.get(
  "/student-dashboard",
  requireAuth,
  requireRole("student"),
  wrapAsync(async (req, res) => {
    if (!currentUser.isProfileComplete) {
      return res.render("pages/complete-profile", {
        layout: "layouts/boilerplate",
        title: "Complete Profile",
        userType: "student",
        user: currentUser,
        cssFile: "profile.css",
        jsFile: "complete-profile.js",
        hideNav: true,
      });
    }

    const opportunities = await Opportunity.find({
      collegeName: currentUser.profile?.collegeName,
      status: "active",
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    const events = await Event.find({
      collegeName: currentUser.profile?.collegeName,
      date: { $gte: new Date() },
    })
      .populate("createdBy", "name")
      .sort({ date: 1 });

    const tpo = await TPO.findOne({
      collegeName: currentUser.profile?.collegeName,
    }).populate("user", "name email");

    res.render("pages/student-dashboard", {
      layout: "layouts/boilerplate",
      title: "Student Dashboard",
      portalName: "Student Portal",
      navItems: [
        { text: "Profile", link: "#profile", active: true },
        { text: "Opportunities", link: "#opportunities" },
        { text: "Events", link: "#events" },
        { text: "TPO Info", link: "#tpo-info" },
      ],
      student: currentUser,
      opportunities,
      events,
      tpoInfo: tpo,
      cssFile: "student-dashboard.css",
      jsFile: "student-dashboard.js",
    });
  })
);

app.get(
  "/tpo-dashboard",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    if (!currentUser.isProfileComplete) {
      return res.render("pages/complete-profile", {
        layout: "layouts/boilerplate",
        title: "Complete Profile",
        userType: "tpo",
        user: currentUser,
        cssFile: "profile.css",
        jsFile: "complete-profile.js",
        hideNav: true,
      });
    }

    const students = await Student.find({
      collegeName: currentUser.profile?.collegeName,
    }).populate({
      path: "user",
      model: "UserAuth",
      select: "name email",
    });

    const stats = {
      totalStudents: await Student.countDocuments({
        collegeName: currentUser.profile?.collegeName,
      }),
      activeOpportunities: await Opportunity.countDocuments({
        collegeName: currentUser.profile?.collegeName,
        status: "active",
      }),
      upcomingEvents: await Event.countDocuments({
        collegeName: currentUser.profile?.collegeName,
        date: { $gte: new Date() },
      }),
    };

    const opportunities = await Opportunity.find({
      collegeName: currentUser.profile?.collegeName,
    }).sort({ createdAt: -1 });

    const events = await Event.find({
      collegeName: currentUser.profile?.collegeName,
    }).sort({ date: -1 });

    res.render("pages/tpo-dashboard", {
      layout: "layouts/boilerplate",
      title: "TPO Dashboard",
      portalName: "TPO Portal",
      navItems: [
        { text: "Dashboard", link: "#dashboard", active: true },
        { text: "Add Opportunity", link: "#add-opportunity" },
        { text: "Add Event", link: "#add-event" },
        { text: "Students", link: "#students" },
      ],
      tpo: currentUser,
      students,
      stats,
      opportunities,
      events,
      cssFile: "tpo-dashboard.css",
      jsFile: "tpo-dashboard.js",
    });
  })
);

app.post(
  "/add-opportunity",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { title, company, description, requirements } = req.body;

    if (!title || !company || !description || !requirements) {
      throw new ExpressError(400, "All fields are required");
    }

    const opportunity = new Opportunity({
      title,
      company,
      description,
      requirements,
      collegeName: currentUser.profile?.collegeName,
      createdBy: currentUser.id,
      status: "active",
    });

    await opportunity.save();

    const savedOpportunity = await Opportunity.findById(opportunity._id);

    res.json({
      success: true,
      opportunity: savedOpportunity,
      message: "Opportunity posted successfully!",
    });
  })
);

app.put(
  "/opportunity/:id",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, company, description, requirements, status } = req.body;

    const opportunity = await Opportunity.findOneAndUpdate(
      {
        _id: id,
        collegeName: currentUser.profile?.collegeName,
      },
      {
        title,
        company,
        description,
        requirements,
        status,
      },
      { new: true }
    );

    if (!opportunity) {
      throw new ExpressError(404, "Opportunity not found");
    }

    res.json({
      success: true,
      opportunity,
      message: "Opportunity updated successfully!",
    });
  })
);

app.delete(
  "/opportunity/:id",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const opportunity = await Opportunity.findOneAndDelete({
      _id: id,
      collegeName: currentUser.profile?.collegeName,
    });

    if (!opportunity) {
      throw new ExpressError(404, "Opportunity not found");
    }

    res.json({
      success: true,
      message: "Opportunity deleted successfully!",
    });
  })
);

app.post(
  "/add-event",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { title, description, date, venue } = req.body;

    const event = new Event({
      title,
      description,
      date,
      venue,
      collegeName: currentUser.profile?.collegeName,
      createdBy: currentUser.id,
    });

    await event.save();

    res.json({
      success: true,
      event,
      message: "Event scheduled successfully!",
    });
  })
);

app.put(
  "/event/:id",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, date, venue } = req.body;

    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        collegeName: currentUser.profile?.collegeName,
      },
      {
        title,
        description,
        date,
        venue,
      },
      { new: true }
    );

    if (!event) {
      throw new ExpressError(404, "Event not found");
    }

    res.json({
      success: true,
      event,
      message: "Event updated successfully!",
    });
  })
);

app.delete(
  "/event/:id",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const event = await Event.findOneAndDelete({
      _id: id,
      collegeName: currentUser.profile?.collegeName,
    });

    if (!event) {
      throw new ExpressError(404, "Event not found");
    }

    res.json({
      success: true,
      message: "Event deleted successfully!",
    });
  })
);

app.get("/logout", (req, res) => {
  currentUser = null;
  res.redirect("/login");
});

app.post(
  "/complete-profile",
  requireAuth,
  wrapAsync(async (req, res) => {
    const {
      collegeId,
      collegeName,
      course,
      year,
      phone,
      designation,
      department,
    } = req.body;

    if (!collegeName) {
      throw new ExpressError(400, "College name is required");
    }

    const userType = currentUser.type;
    let profile;

    if (userType === "student") {
      if (!course || !year) {
        throw new ExpressError(400, "Course and year are required");
      }

      profile = await Student.findByIdAndUpdate(
        currentUser.profile._id,
        {
          $set: {
            collegeId,
            collegeName,
            course,
            year: parseInt(year),
            isProfileComplete: true,
          },
        },
        { new: true }
      );
    } else {
      if (!designation || !department) {
        throw new ExpressError(400, "Designation and department are required");
      }

      profile = await TPO.findByIdAndUpdate(
        currentUser.profile._id,
        {
          $set: {
            collegeId,
            collegeName,
            phone,
            "profile.designation": designation,
            "profile.department": department,
            isProfileComplete: true,
          },
        },
        { new: true }
      );
    }

    if (!profile) {
      throw new ExpressError(404, "Profile not found");
    }

    currentUser.profile = profile;
    currentUser.isProfileComplete = true;

    res.json({
      success: true,
      message: "Profile completed successfully",
    });
  })
);

// Add these routes
app.get(
  "/opportunity/:id/edit",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const opportunity = await Opportunity.findOne({
      _id: id,
      collegeName: currentUser.profile?.collegeName,
    });

    if (!opportunity) {
      throw new ExpressError(404, "Opportunity not found");
    }

    res.render("pages/opp-edit", {
      title: "Edit Opportunity",
      opportunity,
      cssFile: "tpo-dashboard.css",
    });
  })
);

app.get(
  "/event/:id/edit",
  requireAuth,
  requireRole("tpo"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const event = await Event.findOne({
      _id: id,
      collegeName: currentUser.profile?.collegeName,
    });

    if (!event) {
      throw new ExpressError(404, "Event not found");
    }

    res.render("pages/event-edit", {
      title: "Edit Event",
      event,
      cssFile: "tpo-dashboard.css",
    });
  })
);

app.post(
  "/student/social-link",
  requireAuth,
  requireRole("student"),
  wrapAsync(async (req, res) => {
    const { platform, url } = req.body;

    if (!platform || !url) {
      throw new ExpressError(400, "Platform and URL are required");
    }

    const student = await Student.findByIdAndUpdate(
      currentUser.profile._id,
      {
        $push: { socialLinks: { platform, url } },
      },
      { new: true }
    );

    if (!student) {
      throw new ExpressError(404, "Student not found");
    }

    res.json({
      success: true,
      socialLinks: student.socialLinks,
      message: "Social link added successfully!",
    });
  })
);

app.delete(
  "/student/social-link/:id",
  requireAuth,
  requireRole("student"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      currentUser.profile._id,
      {
        $pull: { socialLinks: { _id: id } },
      },
      { new: true }
    );

    if (!student) {
      throw new ExpressError(404, "Student not found");
    }

    res.json({
      success: true,
      socialLinks: student.socialLinks,
      message: "Social link removed successfully!",
    });
  })
);

app.all("*", (req, res) => {
  res.status(404).render("error", {
    layout: "layouts/auth-boilerplate",
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
    backUrl: "/",
    cssFile: "error.css",
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  const { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).render("error", {
    layout: "layouts/auth-boilerplate",
    title: `Error ${statusCode}`,
    message: process.env.NODE_ENV === "production" ? message : err.stack,
    error: process.env.NODE_ENV === "development" ? err : {},
    backUrl: req.headers.referer || "/",
    cssFile: "error.css",
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
