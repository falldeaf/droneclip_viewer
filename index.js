const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8000;

//mp3 file path
let mp3FilePath = ""; // `E:\\DCIM\\DJI_001`;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for '/'
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route to set mp3 file path
app.get('/directory/:path', (req, res) => {
	console.log(req.params.path);
	//url decode
	mp3FilePath = decodeURIComponent(req.params.path);
	res.send('Path set to: ' + mp3FilePath);
});

// Route for getting mp3 file path
app.get('/directory', (req, res) => {
	res.send(mp3FilePath);
});

// Route for file list
app.get('/files', (req, res) => {
	fs.readdir(mp3FilePath, (err, files) => {
		if (err) {
			res.status(500).send('Internal Server Error');
			return;
		}
		const mp4Files = files.filter(file => file.toLowerCase().endsWith('.mp4'));
		const fileNamesWithoutExtension = mp4Files.map(file => path.parse(file).name);
		res.send(fileNamesWithoutExtension.join(','));
	});
});

// Route for mp3 files
app.get('/files/:fileName', (req, res) => {
	const fileName = req.params.fileName;
	const filePath = path.join(mp3FilePath, `${fileName}`);
	console.log(filePath);
	fs.stat(filePath, (err, stats) => {
		if (err) {
			res.status(404).send('File Not Found');
			return;
		}
		res.sendFile(filePath);
	});
});

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://127.0.0.1:${port}/`);
});
