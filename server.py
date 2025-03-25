from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from datetime import datetime
import random

class GridSenseHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/power/current':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Simulate power usage data
            data = {
                'currentUsage': random.uniform(0.5, 5.0),
                'dailyAverage': random.uniform(20, 30),
                'monthlyTotal': random.uniform(500, 800)
            }
            self.wfile.write(json.dumps(data).encode())
            return

        return SimpleHTTPRequestHandler.do_GET(self)

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, GridSenseHandler)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
