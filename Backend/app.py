from flask import Flask,request,jsonify

app = Flask(__name__)

students = ["Simon","Samson","Susan"]

@app.route("/students", methods = ["GET"])
def fetch_students():
    return jsonify(students)

if __name__ == "__main__":
    app.run(debug=True)