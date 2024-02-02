# DJI Drone Clip Viewer

[![Video Title](http://img.youtube.com/vi/9KVybWNTqW0/0.jpg)](http://www.youtube.com/watch?v=9KVybWNTqW0 "Video Title")


## Introduction

The DJI Drone Clip Viewer is an interactive tool designed for drone enthusiasts to view and analyze their flight data in synchrony with their drone footage. It utilizes a Node.js backend to serve a dynamic user interface that presents a rich set of information and controls.

## Features

- **Data Visualization**: Displays latitude, longitude, and elevation data. Elevation is shown in two formats:
  - **REL**: A percentage representing the elevation relative to the lowest and highest points during the flight.
  - **CEL**: A percentage representing the elevation from 0 to 400ft, which is the legal flight ceiling for small drones in many jurisdictions.

- **Path Mapping**: Integrates Google Maps to show the drone's flight path with elevation markers at various points, which can be clicked to navigate to that specific point in the journey.

- **Video Playback**: A video player that shows the footage captured by the drone, synchronized with the data and map elements to provide a real-time playback experience.

- **Control Bar**: Includes playback controls (play, pause, stop), a scrubber to seek through the video, a download button for the current video, and a dropdown menu with a load button to select from a list of available clips. Next and previous buttons are provided for easy navigation between clips.

- **Local Directory Access**: A navigation bar allows users to input the directory of their clips; hitting the folder button will load the clips for viewing.

## Important Notes

- **Local Use Only**: This application is intended for local use and should not be deployed on a server.

- **Directory Access**: There is an express path setup that allows users to serve files from any directory through the front-end interface.

## Getting Started

1. Ensure you have Node.js installed on your local system.
2. Clone the repository to your local machine.
3. Navigate to the cloned directory in your terminal and run `npm install` to install dependencies.
4. To start the application, run `npm start` and access it through your web browser at `localhost:3000`.
5. Input the directory of your drone clips in the navigation bar and click the folder button to load your clips.

## Usage

- The interface is intuitive—play, pause, and navigate through your drone's journey using the provided controls.
- Click on the map markers to jump to different parts of your journey and view corresponding data and video.
- Use the scrubber to seek to different times in the video and observe the synced data change accordingly.

## Contribution

Contributions to the DJI Drone Clip Viewer are welcome. Please follow the contribution guidelines outlined in the `CONTRIBUTING.md` file in the repository.

## License

This project is licensed under the [MIT License](LICENSE). Please see the `LICENSE` file for more details.

## Support

If you encounter any issues or have any questions about using the DJI Drone Clip Viewer, please open an issue in the GitHub repository.

Enjoy your flight data and footage with DJI Drone Clip Viewer!
