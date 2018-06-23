from flask import Flask
from flask import render_template
app = Flask(__name__)

import os

import berlioz
berlioz.setupFlask(app)

@app.route('/')
def hello_world():
    settings = [
        {'name': 'Task ID', 'value': os.environ.get('BERLIOZ_TASK_ID') },
        {'name': 'Instance ID', 'value': os.environ.get('BERLIOZ_INSTANCE_ID') },
        {'name': 'Region', 'value': os.environ.get('BERLIOZ_REGION') }
    ]
    peers = berlioz.getPeers('service', 'app', 'client')
    
    appPeer = {}
    try:
        response = berlioz.request('service', 'app', 'client').get('/')
        appPeer['title'] = 'RESPONSE:'
        appPeer['cardClass'] = 'eastern-blue'
        appPeer['response'] = response.text
    except Exception as ex:
        appPeer['title'] = 'ERROR:'
        appPeer['cardClass'] = 'red'
        appPeer['response'] = str(ex)

    return render_template('index.html', settings=settings, peers=peers, appPeer=appPeer)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')