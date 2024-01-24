const express = require('express');
const path = require('path');
const app = express();
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
const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});