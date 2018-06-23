from flask import Flask
app = Flask(__name__)

import os
from flask import json

import berlioz
berlioz.setupFlask(app)

@app.route('/')
def my_handler():
    return json.dumps({
        'message': 'Hello from App Tier',
        'appId': os.environ['BERLIOZ_TASK_ID']
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')