from http.server import HTTPServer,SimpleHTTPRequestHandler
import os, json
class MyHandler(SimpleHTTPRequestHandler):
	def end_headers(self):
		self.send_my_headers()
		SimpleHTTPRequestHandler.end_headers(self)

	def send_my_headers(self):
		self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
		self.send_header("Pragma", "no-cache")
		self.send_header("Expires", "0")

	def do_GET(self):
		"""Serve a GET request."""
		try:
			f = open(self.translate_path(self.path), 'rb')
		except OSError:
			if os.path.basename(self.path) == "analysis.json":
				self.path = "/missing.json"
			if os.path.basename(self.path) == "manual.json":
				self.path = "/empty.json"
				
		f = self.send_head()
		if f:
			try:
				self.copyfile(f, self.wfile)
			finally:
				f.close()

def run(server_class=HTTPServer, handler_class=MyHandler):
	server_address = ('', 8000)
	httpd = server_class(server_address, handler_class)
	httpd.serve_forever()

run()