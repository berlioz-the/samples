from flask import Flask
from flask import render_template
app = Flask(__name__)

import os

@app.route('/')
def hello_world():
    settings = [
        {'name': 'Task ID', 'value': os.environ.get('BERLIOZ_TASK_ID') },
        {'name': 'Instance ID', 'value': os.environ.get('BERLIOZ_INSTANCE_ID') },
        {'name': 'Region', 'value': os.environ.get('BERLIOZ_REGION') },
        {'name': 'Cluster', 'value': os.environ.get('BERLIOZ_CLUSTER') },
        {'name': 'Service', 'value': os.environ.get('BERLIOZ_SERVICE') }
    ]
    return render_template('index.html', settings=settings)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')