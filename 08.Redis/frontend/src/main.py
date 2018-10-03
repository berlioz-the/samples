from flask import Flask, redirect, render_template, request
app = Flask(__name__)

import json

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.route('/donate', methods=['POST'])
def form_example():
    # return json.dumps(request.form)
    berlioz.service('api').request().post('/donate', data=request.form)
    return redirect("/", code=302)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')