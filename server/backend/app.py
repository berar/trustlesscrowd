# coding=utf8

import setproctitle, sys

from flask import Flask, json, request, abort, render_template
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__, static_url_path='')
app.config['TEMPLATES_AUTO_RELOAD'] = True

limiter = Limiter(app, key_func=get_remote_address, default_limits=["12 per second"], )
cors = CORS(app, resources={r"/*": {"origins": "*"}})

setproctitle.setproctitle('trustlesscrowd')

@app.route('/')
def home():
  return render_template('index.html')

@app.route('/presentation')
def presentation():
  return render_template('presentation.html')

@app.route('/status')
def status():
    return '{ "status": "OK" }'

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = int(sys.argv[1]), debug = False)
