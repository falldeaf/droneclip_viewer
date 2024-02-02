let current_lowest_altitude = 0;
let current_highest_altitude = 0;
//get url variable for clip filename
let urlParams = new URLSearchParams(window.location.search);
let clip_filename = urlParams.get('clip');
let srt_filename = clip_filename + ".SRT";
let video_filenames = [];

function processTextBlob(textBlob) {
	const latLongAltRegex = /latitude: ([\d.-]+).*longitude: ([\d.-]+).*rel_alt: ([\d.-]+)/;
	const matches = textBlob.match(latLongAltRegex);

	if (matches && matches.length === 4) {
		const latitude = parseFloat(matches[1]);
		const longitude = parseFloat(matches[2]);
		const relAlt = parseFloat(matches[3]);

		updateDronePosition(latitude, longitude);
		updateDataDisplay(latitude, longitude, relAlt);
	} else {
		console.error('Latitude, Longitude, and Relative Altitude not found in the text blob');
	}
}

document.addEventListener('DOMContentLoaded', async function () {
	let vttUrl;
	await fetch("files/" + srt_filename).then(response => { return response.text() }).then(data => {
		//console.log(data);
		console.log("SRT file loaded");
		//parse the srt file into waypoints
		//waypoints = parseSrtToWaypoints(data);
		window.current_srt_string = data;

		//add the subtitles to the video
		const vttText = convertSrtToVtt(data);
		const vttBlob = new Blob([vttText], { type: 'text/vtt' });
		vttUrl = URL.createObjectURL(vttBlob);
	});

	//set the current-directory input to the current directory
	await fetch('/directory').then(response => { return response.text() }).then(data => {
		document.getElementById('current-directory').value = data;
	});

	console.log('DOM loaded');

	//add html track to video with text html string '<track id="subtitleTrack" src="test.vtt" kind="subtitles" srclang="en" label="English" default>'
	const videoElement = document.getElementById('videoPlayer');
	videoElement.src = "files/" + clip_filename + ".MP4";
	const track = document.createElement('track');
	track.id = 'subtitleTrack';
	track.kind = 'subtitles';
	track.label = 'English';
	track.srclang = 'en';
	//track.src = "DJI_20240115163315_0007_D.vtt";
	track.src = vttUrl;
	track.default = true;
	track.mode = "hidden";
	videoElement.appendChild(track);

	for (let i = 0; i < videoElement.textTracks.length; i++) {
		videoElement.textTracks[i].mode = "hidden";
	}

	// Listen for cue changes
	track.addEventListener('cuechange', function () {
		const activeCue = this.track.activeCues[0];
		if (activeCue) {
			//console.log(activeCue.text);
			processTextBlob(activeCue.text);
		}
	});

	// Video player controls
	//const videoPlayer = document.getElementById('videoPlayer');
	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const stopButton = document.getElementById('stop');
	const scrubber = document.getElementById('scrubber');
	const videoSelector = document.getElementById('videoSelector');
	const loadButton = document.getElementById('load');
	const nextButton = document.getElementById('next');
	const prevButton = document.getElementById('previous');
	const directory = document.getElementById('directory');
	const downloadButton = document.getElementById('download');
	let scrubbing = false; // Flag to track whether user is scrubbing

	// Play button event listener
	playButton.addEventListener('click', function () {
		console.log('Play button clicked');
		videoElement.play();
	});

	// Pause button event listener
	pauseButton.addEventListener('click', function() {
		videoElement.pause();
	});

	// Stop button event listener
	stopButton.addEventListener('click', function() {
		videoElement.pause();
		videoElement.currentTime = 0;
	});

	// Scrubber event listener
	scrubber.addEventListener('input', function() {
		const scrubTime = videoElement.duration * (scrubber.value / 100);
		console.log("Scrubbing to: " + scrubTime);
		videoElement.currentTime = scrubTime;
		//videoElement.fastSeek(scrubTime);
	});

	// Scrubber event listeners
	scrubber.addEventListener('mousedown', function() {
		videoElement.pause();
		scrubbing = true;

	});

	scrubber.addEventListener('mouseup', function() {
		scrubbing = false;
	});

	// Update scrubber as video plays
	videoElement.addEventListener('timeupdate', function() {
		if (!scrubbing) {
			const value = (100 / videoElement.duration) * videoElement.currentTime;
			scrubber.value = value;
		}
	});

	// Load button event listener
	loadButton.addEventListener('click', function() {
		const selectedVideo = videoSelector.value;
		//navigate to the new video /?clip=selectedVideo
		window.location.href = `/?clip=${selectedVideo}`;
	});

	// Download button event listener
	downloadButton.addEventListener('click', function() {
		//download the current video
		const selectedVideo = videoSelector.value;
		const videoUrl = `files/${selectedVideo}.MP4`;
		downloadFile(videoUrl, `${selectedVideo}.mp4`);
	});

	// Directory event listener
	directory.addEventListener('click', function() {

		/*
		//open a dialog to select a directory
		const input = document.createElement('input');
		input.type = 'file';
		input.webkitdirectory = true; // This is for choosing directories (works in browsers that support it)
		input.multiple = true; // Allow multiple file selection

		input.addEventListener('change', function() {
			const files = Array.from(input.files);
			if (files.length > 0) {
				// Display the relative path of the first file (as a proxy for the directory path)
				// Note: Browsers do not allow access to the full path for security reasons
				console.log(files[0].webkitRelativePath.split('/')[0]);
				document.getElementById('current-directory').value = files[0].webkitRelativePath.split('/')[0];
			}
		});

		input.click(); // Simulate a click on the input to open the file dialog
		*/

		//const current_directory = document.getElementById('current-directory').value;
		//url encode the current directory
		const current_directory = encodeURIComponent(document.getElementById('current-directory').value);



		//set the directory to search for videos
		fetch('/directory/' + current_directory).then(response => { return response.text() }).then(data => {
			console.log(data);

			//get the new list of available videos from the server (/files) returns a csv list of video filenames without extension
			fetch('/files').then(response => { return response.text() }).then(data => {
				//console.log(data);
				console.log("Video list loaded");
				video_filenames = data.split(',');
				console.log(video_filenames);

				if(video_filenames.length > 0) {
					//reload the page with the first video in the list
					window.location.href = `/?clip=${video_filenames[0]}`;
				} else {
					console.log("No videos found in the directory!");
				}
			});
		});

	});

	// Get list of available videos from the server (/files) returns a csv list of video filenames without extension
	await fetch('/files').then(response => { return response.text() }).then(data => {
		//console.log(data);
		console.log("Video list loaded");
		video_filenames = data.split(',');
		console.log(video_filenames);

		//add the video filenames to the video selector
		for (let i = 0; i < video_filenames.length; i++) {
			let option = document.createElement('option');
			option.value = video_filenames[i];
			option.text = video_filenames[i];
			//console.log(video_filenames[i] + " === " + clip_filename);
			if(video_filenames[i] === clip_filename) {
				option.style = "font-weight: bold; color: #ff79c6;";
				option.selected = true;
			}
			videoSelector.appendChild(option);
		}

		//set the video selector to the current video
		videoSelector.value = clip_filename;
	});


	// TODO: Add event listeners for Previous and Next buttons if you have a video playlist
	// Next button event listener
	nextButton.addEventListener('click', function() {
		//navigate to the next video in the list
		let index = video_filenames.indexOf(clip_filename);
		if (index < video_filenames.length - 1) {
			index++;
		}
		window.location.href = `/?clip=${video_filenames[index]}`;
	});

	// Previous button event listener
	prevButton.addEventListener('click', function() {
		//navigate to the previous video in the list
		let index = video_filenames.indexOf(clip_filename);
		if (index > 0) {
			index--;
		}
		window.location.href = `/?clip=${video_filenames[index]}`;
	});

});

async function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 5,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	});

	// Add a drone marker
	window.droneMarker = new google.maps.Marker({
		position: { lat: 39.982135, lng: -75.190272 }, // Initial position, you can change it
		map: map,
		icon: {
			url: 'drone_marker.png', // Replace with the path to your drone icon
			scaledSize: new google.maps.Size(60, 60), // Adjust size as needed
			anchor: new google.maps.Point(30, 30) // Center of the image
		},
		zIndex: 99999 // High zIndex to ensure it's on top of other markers
	});

	/*
let waypoints = [
	// ... your waypoints ...
	{ lat: 37.772, lng: -122.214, elevation: 10 },
	{ lat: 21.291, lng: -157.821, elevation: 20 },
	{ lat: -18.142, lng: 178.431, elevation: 30 },
	{ lat: -27.467, lng: 153.027, elevation: 40 },
];
*/

	//fetch the srt file
	let waypoints;
	//waypoints = parseSrtToWaypoints(window.current_srt_string);
	await fetch("files/" + srt_filename).then(response => { return response.text() }).then(data => {
		//console.log(data);
		console.log("SRT file loaded");
		//parse the srt file into waypoints
		waypoints = parseSrtToWaypoints(data);
		//add the subtitles to the video
		//addSubtitlesToVideo(data);
	});
	//let waypoints = parseSrtToWaypoints(srtString);
	console.log(waypoints);

	let bounds = new google.maps.LatLngBounds();
	waypoints.forEach(point => {
		bounds.extend(new google.maps.LatLng(point.lat, point.lng));
	});

	map.fitBounds(bounds);

	let path = waypoints.map(point => ({ lat: point.lat, lng: point.lng }));

	const flightPath = new google.maps.Polyline({
		path: path,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 4,
	});

	flightPath.setMap(map);

	const circleIcon = {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: 'white',
		fillOpacity: 0.6,
		scale: 10, // Size of the circle
		strokeColor: 'blue',
		strokeWeight: 1
	};

	waypoints.forEach((point, index) => {
		const marker = new google.maps.Marker({
			position: { lat: point.lat, lng: point.lng },
			map: map,
			icon: circleIcon,
			label: {
				text: `${point.elevation}`,
				color: 'black',
				fontSize: '10px'
			}
		});

		// Adding a click event listener to the marker
		marker.addListener('click', function() {
			skipto(point.time); // Call the skipto function with the time of the waypoint
		});
	});
}

function skipto(time) {
	console.log('Skipping to ' + time);
	const videoElement = document.getElementById('videoPlayer');
	videoElement.currentTime = time;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371e3; // meters (earth's radius)
	const phi1 = lat1 * Math.PI / 180;
	const phi2 = lat2 * Math.PI / 180;
	const deltaPhi = (lat2 - lat1) * Math.PI / 180;
	const deltaLambda = (lon2 - lon1) * Math.PI / 180;

	const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
		Math.cos(phi1) * Math.cos(phi2) *
		Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in meters
}

function parseSrtToWaypoints(srtString, minDistance = 2) {
	const entries = srtString.split(/\n\n/);
	const waypoints = [];

	entries.forEach((entry, index) => {
		const lines = entry.split('\n');

		// Check if the second line (expected to be the timecode) exists
		if (lines.length < 2) {
			return; // Skip this entry if the second line does not exist
		}

		const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
		if (!timeMatch) {
			return; // Skip entry if time format is not found
		}

		const hours = parseInt(timeMatch[1]);
		const minutes = parseInt(timeMatch[2]);
		const seconds = parseInt(timeMatch[3]);
		const milliseconds = parseInt(timeMatch[4]);
		const totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

		lines.forEach(line => {
			const latMatch = line.match(/\[latitude: ([\d.-]+)\]/);
			const longMatch = line.match(/\[longitude: ([\d.-]+)\]/);
			const elevMatch = line.match(/\[rel_alt: ([\d.-]+)/);

			if (latMatch && longMatch && elevMatch) {
				const lat = parseFloat(latMatch[1]);
				const lng = parseFloat(longMatch[1]);
				const elevation = parseFloat(elevMatch[1]);

				if (index === 0) {
					current_lowest_altitude = elevation;
					current_highest_altitude = elevation;
				} else {
					if (elevation < current_lowest_altitude) {
						current_lowest_altitude = elevation;
					}
					if (elevation > current_highest_altitude) {
						current_highest_altitude = elevation;
					}
				}

				const lastWaypoint = waypoints[waypoints.length - 1];
				if (!lastWaypoint || calculateDistance(lat, lng, lastWaypoint.lat, lastWaypoint.lng) >= minDistance) {
					waypoints.push({ lat, lng, elevation, time: totalSeconds });
				}
			}
		});
	});

	return waypoints;
}

function convertSrtToVtt(srtText) {
	let vttText = 'WEBVTT\n\n';
	vttText += srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
	return vttText;
}

function updateDronePosition(newLat, newLng) {
	const newPosition = new google.maps.LatLng(newLat, newLng);
	if (droneMarker) {
		window.droneMarker.setPosition(newPosition);
	}
}

function updateDataDisplay(latitude, longitude, alt) {
	//nicely format the latitude and longitude in hours, minutes, seconds
	const formatted_latitude = formatLatLongToHMS(latitude);
	const formatted_longitude = formatLatLongToHMS(longitude);

	document.getElementById('latitude').innerHTML = formatted_latitude;
	document.getElementById('longitude').innerHTML = formatted_longitude;

	//display the altitude for bar 1 (#alt1 style height should be % where 0 is the lowest altitude and 100 is the highest altitude)
	document.getElementById('alt1').style.height = `${((alt - current_lowest_altitude) / (current_highest_altitude - current_lowest_altitude)) * 100}%`;
	document.getElementById('alt1-value').innerText = alt;

	//display the altitude for bar 2 (#alt2 style height is ratio of 0 to 400)
	document.getElementById('alt2').style.height = `${(alt / 400) * 100}%`;
	document.getElementById('alt2-value').innerText = alt;
}

function formatLatLongToHMS(value) {
	let degrees = Math.floor(value);
	let minutesFloat = Math.abs(value - degrees) * 60;
	let minutes = Math.floor(minutesFloat);
	let secondsFloat = (minutesFloat - minutes) * 60;
	let seconds = Math.floor(secondsFloat);
	let milliseconds = Math.floor((secondsFloat - seconds) * 1000);

	//return `${degrees}° ${minutes}' ${seconds}.${milliseconds}"`;
	return `<span style="color: #ff79c6;">${degrees}°</span> <span style="color: #8be9fd;">${minutes}'</span> <span style="color: #50fa7b;">${seconds}.${milliseconds}"</span>`;
}

async function downloadFile(url, fileName) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.blob();
		const blobUrl = window.URL.createObjectURL(data);

		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = blobUrl;
		a.download = fileName || 'download';

		document.body.appendChild(a);
		a.click();

		window.URL.revokeObjectURL(blobUrl);
		document.body.removeChild(a);
	} catch (error) {
		console.error('Download failed:', error);
	}
}
