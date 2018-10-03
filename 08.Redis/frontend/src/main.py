from flask import Flask
from flask import render_template
app = Flask(__name__)

import json

import berlioz
berlioz.setupFlask(app)

@app.route('/')
def index():

    campaign = {}
    try:
        response = berlioz.service('api').request().get('/amount')
        body = json.loads(response.text)
        campaign['amount'] = '$' + str(body['value'])
    except Exception as ex:
        campaign['amount'] = 'N/A'
        campaign['error'] = str(ex)


    recent = {}

    return render_template('index.html', campaign=campaign, recent=recent)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')