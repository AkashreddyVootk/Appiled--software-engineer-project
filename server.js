const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User=require('./models/user');
const http=require('http');
const socketIo=require('socket.io');
const server=http.createServer(app);
const fetch =require('node-fetch');
let io=socketIo(server);
const Content = require('./models/Content');
const NEWS_API_KEY = '6c3e7f3d41d846f4821ecd45a908be7e';
const BASE_URL = 'https://newsapi.org/v2';
const axios = require('axios');
mongoose.connect('mongodb+srv://DeakinUniHelp:eT0KB6dk8jmv3l4k@cluster0.nwhttxz.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});
app.get('/staff', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/staff.html'));
});

app.get('/student', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/student.html'));
});

app.get('/international-students', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/internationalStudents.html'));
});

app.get('/admin', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/Admin.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/signup.html'));
});
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, "/views/login.html")); 
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username, password: password });
        if (!user) {
            return res.status(401).send('Login failed. User not found or password does not match.');
        }
        switch(user.role) {
            case 'admin':
              return res.redirect('/admin');
            case 'student':
              return res.redirect('/student');
            case 'staff':
                return res.redirect('/staff');
            case 'international-students':
                return res.redirect('/international-students');
            default:
              // Handle unknown role or redirect to a default page
              return res.redirect('/');
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'avootkuri@gmail.com', // your Gmail address
      pass: 'vgpkuraaedmfrtxy' // your app password
    }
  });
app.post('/signup', async (req, res) => {
    const { username, password ,role,email} = req.body;

    const user = new User({ username, password,role,email});

    try {
        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error creating user' });
    }

let mailOptions = {
        from: '"Deakin University Help" ', // sender address
        to: req.body.email, // list of receivers
        subject: 'Welcome to Our Deakin help Website!', // Subject line
        text: 'Thank you for registering with us.', // plain text body
        html: '<b>Thank you for registering with us.</b>' // html body
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });    
});
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Update '*' to your domain in production
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.use(express.json());
// POST endpoint for updating content
app.post('/api/content', async (req, res) => {
    const pageType = req.body.pageType;
    const title = req.body.title;
    const content = req.body.content;

    // Log the variables to debug
    console.log({ pageType, title, content });

    try {
        const updatedContent = await Content.findOneAndUpdate(
            { pageType: pageType },
            { title: title, content: content },
            { new: true, upsert: true }
        );
        res.json({ message: 'Content updated successfully', updatedContent });
    } catch (error) {
        console.error('Failed to update content', error);
        res.status(500).json({ message: 'Server error' });
    }
});

  
const fetchNews = async () => {
    const url = `https://newsapi.org/v2/everything?q=education&from=2024-01-07&sortBy=publishedAt&apiKey=6c3e7f3d41d846f4821ecd45a908be7e`;
    try {
        const response = await axios.get(url);
        return response.data.articles;
    } catch (error) {
        console.error('Error fetching news from NewsAPI:', error);
        return [];
    }
};

io.on('connection', (socket) => {
    console.log('New client connected');
    fetchNews().then(articles => socket.emit('news', articles));
    const intervalId = setInterval(() => {
        fetchNews().then(articles => socket.emit('news', articles));
    }, 30000); // 30000 milliseconds = 30 seconds

    // Clear the interval when the client disconnects
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});


// Inside your server.js or wherever you've set up your routes

app.get('/api/content/:pageType', async (req, res) => {
    try {
        const { pageType } = req.params;
        const content = await Content.findOne({ pageType });
        if (content) {
            res.json(content);
        } else {
            res.status(404).send({ message: "Content not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
});

  


server.listen(3000, () => console.log('Server started on port 3000'));

