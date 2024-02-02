#!/usr/bin/env python3
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

class MyHandler(SimpleHTTPRequestHandler):
	def do_GET(self):
		# Parse the URL path
		parsed_path = urlparse(self.path)
		path = parsed_path.path

		if path == '/':
			# Serve index.html for root
			self.serve_file('public/index.html')
		elif path == '/files':
			# List .MP4 files
			self.list_mp4_files()
		else:
			# Serve other files from the public folder
			self.serve_file('public' + path)

	def serve_file(self, path):
		try:
			with open(path, 'rb') as file:
				self.send_response(200)
				# Determine content type based on file extension
				if path.endswith(".html"):
					content_type = 'text/html'
				elif path.endswith(".js"):
					content_type = 'application/javascript'
				elif path.endswith(".css"):
					content_type = 'text/css'
				elif path.endswith(".mp4"):
					content_type = 'video/mp4'
				else:
					content_type = 'text/plain'
				self.send_header('Content-type', content_type)
				self.end_headers()
				self.wfile.write(file.read())
		except IOError:
			self.send_error(404, 'File Not Found: %s' % path)

	def list_mp4_files(self):
		try:
			# List all .MP4 files in the 'public' folder
			mp4_files = [f for f in os.listdir('public') if f.lower().endswith('.mp4')]

			# Remove the '.mp4' extension from filenames
			file_names_without_extension = [os.path.splitext(f)[0] for f in mp4_files]

			# Create a CSV string
			csv_string = ','.join(file_names_without_extension)

			self.send_response(200)
			self.send_header('Content-type', 'text/plain')
			self.end_headers()
			self.wfile.write(csv_string.encode())
		except Exception as e:
			self.send_error(500, 'Internal Server Error: %s' % str(e))


if __name__ == '__main__':
	httpd = HTTPServer(('127.0.0.1', 8000), MyHandler)
	httpd.serve_forever()
