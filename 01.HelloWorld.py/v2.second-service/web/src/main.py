from flask import Flask
app = Flask(__name__)

import berlioz
berlioz.setupFlask(app)

@app.route('/')
def hello_world():
    res = 'Flask Dockerized. '
    data = berlioz.request('service', 'app', 'client').get('/')
    res = res + data.text
    return res

@app.route('/kuku')
def lalalalalal():
    res = 'KUKU: Flask Dockerized. '
    data = berlioz.request('service', 'app', 'client').get('/')
    res = res + data.text
    return res
 
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')