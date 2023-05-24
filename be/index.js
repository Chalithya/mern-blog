require("dotenv").config();
const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const dbConnection = require("./config/db_conection");
const { fileHandler, passwordEncrypter } = require("./helpers/post.helper");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
const secret = "testtesttestsecret";

dbConnection();

app.post("/register", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const hashedPassword = await passwordEncrypter(password);

    let profileImagePath = fileHandler(req.file);

    const userDoc = await User.create({
      username,
      email,
      profilePicture: profileImagePath,
      password: hashedPassword,
    });

    res.json(userDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const userDoc = await User.findOne({ username });
    const passwordMatch = await bcrypt.compare(password, userDoc.password);
    if (!userDoc || !passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username, id: userDoc._id }, secret, {});
    res.cookie("token", token).json({
      id: userDoc._id,
      username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.get("/profile", (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        console.error(err);
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = info;
      const userDoc = await User.findById(id);

      const userData = {
        username: info.username,
        id: info.id,
        email: userDoc?.email,
        profilePicture: userDoc?.profilePicture,
      };

      res.json(userData);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.put("/profile", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        console.error(err);
        return res.status(401).json({ error: "Unauthorized" });
      }

      let profileImagePath = fileHandler(req.file);

      const { id } = info;
      const { username, password, email } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      var hashedPassword = null;
      if (password) {
        hashedPassword = await passwordEncrypter(password);
      }

      user.username = username || user.username;
      user.email = email || user.email;
      user.password = hashedPassword || user.password;
      user.profilePicture = profileImagePath || user.profilePicture;

      const updatedUser = await user.save();

      const responseData = {
        username: updatedUser.username,
        id: updatedUser.id,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      };

      res.json(responseData);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/logout", (req, res) => {
  try {
    res.clearCookie("token").json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { token } = req.cookies;
    const info = jwt.verify(token, secret);
    const { heading, postBody } = req.body;

    let newPath = fileHandler(req.file);

    const postDoc = await Post.create({
      heading,
      postBody,
      coverImage: newPath,
      author: info.id,
    });

    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating a post" });
  }
});

app.put("/post/:id", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.cookies;
    const info = jwt.verify(token, secret);
    const { heading, postBody } = req.body;

    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isAuthor = String(postDoc.author) === String(info.id);
    if (!isAuthor) {
      return res.status(400).json({ error: "You are not the author" });
    }

    let newPath = fileHandler(req.file);

    postDoc.heading = heading;
    postDoc.postBody = postBody;
    postDoc.coverImage = newPath ? newPath : postDoc.coverImage;
    await postDoc.save();

    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the post" });
  }
});

app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);

    const postsWithDefaultCover = posts.map((post) => {
      if (!post.coverImage) {
        return {
          ...post._doc,
          coverImage: "uploads\\default\\default.jpg",
        };
      }
      return post;
    });

    res.json(postsWithDefaultCover);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
});

app.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate("author", ["username"]);
    if (!postDoc) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post" });
  }
});

app.delete("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.cookies;
    const info = jwt.verify(token, secret);

    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isAuthor = String(postDoc.author) === String(info.id);
    if (!isAuthor) {
      return res.status(400).json({ error: "You are not the author" });
    }

    await postDoc.remove();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the post" });
  }
});

app.listen(4000, console.log("listening on http://localhost:4000"));
