from flask import Flask, request, jsonify, render_template, redirect,url_for, session, send_file
from flask_cors import CORS
import sqlite3, os
from datetime import datetime, timezone, timedelta

# 连接到数据库
db = sqlite3.connect('mydatabase.db', check_same_thread=False)
db2 = sqlite3.connect('historyRecord.db', check_same_thread=False)
db3 = sqlite3.connect('stockData.db', check_same_thread=False)

cursor = db.cursor()
history = db2.cursor()
stockData = db3.cursor()

app = Flask(__name__, template_folder = 'templates')
CORS(app)
# app.secret_key = os.urandom(24)

@app.route("/")
def index():
        if session['login_in'] is True:
                return redirect(url_for('api/history_data'))
        return redirect(url_for('api/login'))

@app.route("/image")
def image():
        image_path = './templates/assets/image/eitem.jpg'
        return send_file(image_path, 'image/jpg')

@app.route("/api/upload_data", methods=['GET'])
def upload_data():
        cursor.execute("DELETE FROM eitems ")
        status = request.args.get("status")
        packageNum = request.args.get("packages")
        LEDnum = request.args.get("LED")
        R1num = request.args.get("R1")
        R2num = request.args.get("R2")
        R3num = request.args.get("R3")
        dynatronNum = request.args.get("dynatron")
        random = request.args.get("random")
        dt_str = request.args.get("date")
        if dt_str == None:
                dt_str = 0
        else:
                dt_str = dt_str.strip('"')
        # 时间处理
                milliseconds = dt_str.split('.')[1].rstrip('Z')[:3]
                microseconds = milliseconds.ljust(6, '0')  # 将毫秒扩展到6位微秒

                dt = datetime.strptime(dt_str.split('.')[0] + '.' + microseconds, "%Y-%m-%dT%H:%M:%S.%f")

        # 设置时区为UTC
                dt = dt.replace(tzinfo=timezone.utc)
                dt = dt.astimezone(timezone(timedelta(hours=8)))
                Date = dt.strftime("%Y-%m-%d %H:%M:%S")
        

        if LEDnum == None:
                LEDnum = 0
        if R1num == None:
                R1num = 0
        if R2num == None:
                R2num = 0
        if R3num == None:
                R3num = 0
        if dynatronNum == None:
                dynatronNum = 0
        
        try:
                cursor.execute("INSERT INTO eitems (status, packageNum, LEDnum, R1num, R2num, R3num, dynatronNum, random) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (status, packageNum, LEDnum, R1num, R2num, R3num, dynatronNum, random))
                history.execute("INSERT INTO record (Date, status, packageNum, LEDnum, R1num, R2num, R3num, dynatronNum) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (Date, status, packageNum, LEDnum, R1num, R2num, R3num, dynatronNum))
                db.commit()
                db2.commit()
                
                return jsonify({"message": "Data updated successfully"}), 200
        except sqlite3.Error as e:
                db.rollback()
                db2.rollback()
                return jsonify({"error": str(e)}), 500
        

@app.route("/api/download_data", methods=['GET', 'POST'])
def download_data():
        
        try:
                
                cursor.execute("SELECT status, packageNum, LEDnum, R1num, R2num, R3num, dynatronNum, random FROM eitems")
                result = cursor.fetchall()
                return jsonify(result)  # 使用 jsonify 直接返回 JSON 数据
        except sqlite3.Error as e:
                return jsonify({"error": str(e)}), 500
        
@app.route("/api/upload_stockData", methods=['GET', 'POST'])
def upload_stockData():
        LEDrest = request.args.get("LEDrest")
        R1rest = request.args.get("R1rest")
        R2rest = request.args.get("R2rest")
        R3rest = request.args.get("R3rest")
        dynatronRest = request.args.get("dynatronRest")
        try:
                stockData.execute("UPDATE stock SET LEDrest = ?, R1rest = ?, R2rest = ?, R3rest = ?, dynatronRest = ?", (LEDrest, R1rest, R2rest, R3rest, dynatronRest))
                db3.commit()
                return jsonify({"message": "Data updated successfully"}), 200
        except sqlite3.Error as e:
                db3.rollback()
                return jsonify({"error": str(e)}), 500
        
@app.route("/api/download_stockData", methods=['GET', 'POST'])
def download_stockData():
        try:
                stockData.execute("SELECT LEDrest, R1rest, R2rest, R3rest, dynatronRest FROM stock")
                result = stockData.fetchall()
                return jsonify(result)
        except sqlite3.Error as e:
                return jsonify({"error": str(e)}), 500


@app.route("/api/history_data", methods=['GET', 'POST'])
def history_data():
        try:
                history.execute("SELECT Date, status, packageNum, LEDnum, R1num, R2num, R3num, dynatronNum FROM record")
                result = history.fetchall()
                
                return render_template("index.html", data=result)
        
        except sqlite3.Error as e:
                return jsonify({"error": str(e)}), 500
        
@app.route("/api/check", methods=['GET', 'POST'])
def check():
        if request.method == "POST":
                username = request.form.get('username')
                password = request.form.get('password')

                print(username, password)
                
                if username == 'root' and password == 'Abc123456':
                        app.logger.info("登录成功!")
                        session['login_in'] = True
                        return redirect(url_for('history_data'))
                else:
                        app.logger.warning("用户名或密码错误!")
                        return redirect(url_for('login'))
        return redirect(url_for('login'))

        
@app.route("/api/login", methods=['GET', 'POST'])
def login():
        return render_template('login.html')

@app.route('/api/logout', methods=['GET', 'POST'])
def logout():
        session['login_in'] = False 
        return redirect(url_for('login'))  

@app.route("/api/history_data/statistic", methods=['GET', 'POST'])
def statistic():
        return render_template('statistic.html')




if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000, debug=True)

