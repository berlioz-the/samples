from flask import Flask
app = Flask(__name__)

import berlioz
berlioz.setupFlask(app)

@app.route('/')
def my_handler():
    return '<b>FROM APP</b>'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')