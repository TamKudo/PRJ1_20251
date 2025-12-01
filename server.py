from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# Cấu hình kết nối MySQL
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'mini_clothing_store'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# --- API SẢN PHẨM (GIỮ NGUYÊN) ---
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        # Lấy từ khóa tìm kiếm từ URL (ví dụ: /api/products?search=shirt)
        search_query = request.args.get('search') 

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if search_query:
            # Nếu có tìm kiếm -> Dùng câu lệnh LIKE
            sql = "SELECT * FROM products WHERE product_name LIKE %s"
            # Thêm dấu % vào 2 đầu để tìm kiếm tương đối (chứa từ khóa)
            params = (f"%{search_query}%",) 
            cursor.execute(sql, params)
        else:
            # Nếu không tìm kiếm -> Lấy hết
            cursor.execute("SELECT * FROM products")
            
        rows = cursor.fetchall()
        
        formatted_products = []
        for row in rows:
            item = {
                "id": row['product_id'],
                "name": row['product_name'],
                "price": f"${row['price']}",
                "image": row['image'],
                "tag": row['tag'],
                "rating": row['rating'],
                "category": row['category_slug'],
                "colors": 2,
            }
            formatted_products.append(item)

        cursor.close()
        conn.close()
        return jsonify(formatted_products)
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)})
# --- API ĐĂNG KÝ (MỚI) ---
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json # Lấy dữ liệu từ JS gửi lên
        full_name = data.get('username') # Form JS gửi 'username', ta lưu vào 'full_name'
        email = data.get('email')
        password = data.get('password')

        conn = get_db_connection()
        cursor = conn.cursor()

        # Kiểm tra xem email đã tồn tại chưa
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Email này đã được sử dụng!"})

        # Thêm người dùng mới (Mặc định role là customer)
        sql = "INSERT INTO users (full_name, email, password, role) VALUES (%s, %s, %s, 'customer')"
        cursor.execute(sql, (full_name, email, password))
        conn.commit()

        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Đăng ký thành công!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# --- API ĐĂNG NHẬP (MỚI) ---
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email_login = data.get('email') # Frontend gửi email
        password_login = data.get('password')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Kiểm tra email và password
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        cursor.execute(sql, (email_login, password_login))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            # Trả về thông tin user (trừ mật khẩu)
            return jsonify({
                "success": True, 
                "message": "Đăng nhập thành công!",
                "user": {
                    "username": user['full_name'],
                    "email": user['email'],
                    "role": user['role']
                }
            })
        else:
            return jsonify({"success": False, "message": "Sai email hoặc mật khẩu!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)