"""用作数据库的初始化"""
from flask import jsonify
import sqlite3

# 连接到数据库
db = sqlite3.connect('mydatabase.db')
db2 = sqlite3.connect('historyRecord.db')
db3 = sqlite3.connect('stockData.db')
# user = sqlite3.connect('user.db')

cursor = db.cursor()
history = db2.cursor()
stockData = db3.cursor()
# user = user.cursor()


# user.execute('''
# CREATE TABLE IF NOT EXISTS user (
#         username TEXT NOT NULL,
#         password TEXT NOT NULL
# )
# ''')

cursor.execute('''CREATE TABLE IF NOT EXISTS 
        eitems (
        id INTEGER,
        status INTEGER,
        packageNum INTEGER,
        LEDnum INTEGER,
        R1num INTEGER,
        R2num INTEGER,
        R3num INTEGER,
        dynatronNum INTEGER,
        random INTEGER);''')

history.execute('''
CREATE TABLE IF NOT EXISTS
        record (
                Date TEXT,
                status INTEGER,
                packageNum INTEGER,
                LEDnum INTEGER,
        R1num INTEGER,
        R2num INTEGER,
        R3num INTEGER,
        dynatronNum INTEGER
                );
''')

stockData.execute('''
CREATE TABLE IF NOT EXISTS
        stock(
                LEDrest INTEGER,
        R1rest INTEGER,
        R2rest INTEGER,
        R3rest INTEGER,
        dynatronRest INTEGER
                )
''')


stockData.execute("DELETE FROM stock")
stockData.execute("INSERT INTO stock (LEDrest, R1rest, R2rest, R3rest, dynatronRest) VALUES (?, ?, ?, ?, ?)", (20, 20, 20, 20, 10))
db3.commit()


print("done")