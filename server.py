from http.server import HTTPServer,SimpleHTTPRequestHandler
import os, json
class MyHandler(SimpleHTTPRequestHandler):
	def do_GET(self):
		"""Serve a GET request."""
		try:
			f = open(self.translate_path(self.path), 'rb')
		except OSError:
			if os.path.basename(self.path) == "analysis.json":
				self.path = "/missing.json"
				
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