from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import os
import re
import jwt
import time
import base64
import hashlib
import logging
import cv2
import numpy as np
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from os.path import join, dirname
from PIL import Image
from bson import ObjectId, json_util
from flask import Flask, render_template, request, jsonify, redirect, url_for, current_app as app
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.serving import is_running_from_reloader
from apscheduler.schedulers.background import BackgroundScheduler
from midtransclient import Snap

# === Load .env ===
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

# === Konfigurasi dari .env ===
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret")
TOKEN_KEY = os.getenv("TOKEN_KEY", "default-token")
MIDTRANS_SERVER_KEY = os.getenv("MIDTRANS_SERVER_KEY")
MIDTRANS_CLIENT_KEY = os.getenv("MIDTRANS_CLIENT_KEY")

# === Inisialisasi Flask ===
app = Flask(__name__, instance_relative_config=True)

# Buat folder instance dataset dan model saat app dijalankan
os.makedirs(os.path.join(app.instance_path, 'dataset'), exist_ok=True)
os.makedirs(os.path.join(app.instance_path, 'models'), exist_ok=True)

# === MongoDB ===
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# === Midtrans Snap ===
snap = Snap(
    is_production=False,
    server_key=MIDTRANS_SERVER_KEY,
    client_key=MIDTRANS_CLIENT_KEY
)

# === Logging ===
logging.basicConfig(level=logging.INFO)


@app.route('/')
def index():
    return render_template('index.html')


@app.route("/sendchat", methods=['POST'])
def send_chat():
    data = request.get_json()
    orderid = data.get('orderid')
    message = data.get('message')

    # Ambil username dari cookie
    username = request.cookies.get('username')
    role = request.cookies.get('role')

    if not orderid or not message or not username:
        return jsonify({'result': 'error', 'message': 'Data tidak lengkap atau cookie tidak ditemukan'})

    db.livechat.insert_one({
        'orderid': orderid,
        'sender': username,
        'role': role,
        'message': message,
        'timestamp': datetime.now(ZoneInfo("Asia/Jakarta"))
    })

    return jsonify({'result': 'success'})


@app.route("/getchat")
def get_chat():
    orderid = request.args.get('orderid')
    if not orderid:
        return jsonify({'result': 'error', 'message': 'Order ID diperlukan'})

    # Cek apakah order masih ada di koleksi orderan
    order = db.orderan.find_one({'order_id': orderid})
    if not order:
        # Jika tidak ada, hapus semua chat dengan orderid tersebut
        deleted = db.livechat.delete_many({'orderid': orderid})
        return jsonify({'result': 'error', 'message': f'Order tidak ditemukan. {deleted.deleted_count} chat telah dihapus.'})

    # Ambil dan kembalikan daftar chat
    chat_cursor = db.livechat.find({'orderid': orderid}).sort('timestamp', 1)
    chat_list = [
        {
            'sender': c['sender'],
            'message': c['message'],
            'timestamp': c['timestamp'].isoformat()
        }
        for c in chat_cursor
    ]
    return jsonify({'result': 'success', 'chat': chat_list})


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/sign_in', methods=["POST"])
def sign_in():
    username_receive = request.form.get('username_give')
    password_receive = request.form.get('password_give')
    pw_hash = hashlib.sha256(password_receive.encode("utf-8")).hexdigest()
    result = db.login.find_one({
        "username": username_receive,
        "password": pw_hash,
    })
    if result:
        payload = {
            'id': username_receive,
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify(
            {
                "result": "success",
                "token": token,
                "role": result["role"],
                "username": result["username"]
            }
        )

    else:
        return jsonify(
            {
                "result": "fail",
                "msg": "Username/pasword yang anda masukan salah",
            }
        )


@app.route('/check_id', methods=['POST'])
def check_id():
    username_receive = request.form['username_give']
    exists = bool(db.login.find_one({'username': username_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/check_judul', methods=['POST'])
def check_judul():
    judul_receive = request.form['judul_give']
    exists = bool(db.barang.find_one({'JudulBuku': judul_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/registuser')
def registuser():
    return render_template('regisuser.html')


@app.route('/ruser', methods=["POST"])
def ruser():
    email_receive = request.form.get('email')
    username_receive = request.form.get('username_give')
    password_receive = request.form.get('password_give')
    password_hash = hashlib.sha256(
        password_receive.encode('utf-8')).hexdigest()

    doc = {
        'email': email_receive,
        'username': username_receive,
        'password': password_hash,
        'nohp': '',
        'alamat': '',
        'profile_default': 'profile/profil_default.jpg',
        'role': 'user'
    }
    db.login.insert_one(doc)
    return jsonify({'result': 'success'})


@app.route('/adminpage')
def adminpage():
    return render_template('admin.html')


@app.route('/userpage')
def userpage():
    return render_template('user.html')


@app.route('/deletebook', methods=['POST'])
def deletebook():
    judul = request.form.get('judul_give')
    buku = db.barang.find_one({"JudulBuku": judul}, {"_id": False})
    url = buku.get("URL")

    # Ambil semua cover yang terkait
    cover_old_list = buku.get("AllCover", [])
    if isinstance(cover_old_list, str):
        cover_old_list = [cover_old_list]

    # Hapus file gambar satu per satu
    for old_path in cover_old_list:
        full_path = os.path.join("static", old_path)
        if os.path.exists(full_path):
            os.remove(full_path)

    # Hapus data dari database
    db.barang.delete_one({'JudulBuku': judul})
    db.favorite.delete_many({'JudulBuku': url})
    db.cart.delete_many({'JudulBuku': url})

    return jsonify({
        'result': 'success',
        'msg': f'{judul} telah dihapus',
    })


@app.route('/admin')
def admin():
    return render_template('regisadmin.html')


@app.route('/radmin', methods=["POST"])
def radmin():
    email_receive = request.form.get('email')
    nomor_receive = request.form.get('nomor_give')
    username_receive = request.form.get('username_give')
    password_receive = request.form.get('password_give')
    password_hash = hashlib.sha256(
        password_receive.encode('utf-8')).hexdigest()

    doc = {
        'email': email_receive,
        'username': username_receive,
        'password': password_hash,
        'nohp': nomor_receive,
        'alamat': '',
        'profile_default': 'profile/profil_default.jpg',
        'role': 'admin'
    }
    db.login.insert_one(doc)
    return jsonify({'result': 'success'})


@app.route('/buku')
def buku():
    user_receive = request.cookies.get("username")
    book_list = list(db.barang.find({}, {'_id': False}))
    user_list = list(db.login.find({'role': 'user'}, {'_id': False}))
    favorite_list = list(db.favorite.find(
        {'username': user_receive}, {'_id': False}))
    cart_list = list(db.cart.find({'username': user_receive}, {'_id': False}))
    order_list = list(db.orderan.find({}, {'_id': False}))

    return jsonify({
        'daftarbuku': book_list,
        'daftaruser': user_list,
        'daftarfavorite': favorite_list,
        'daftarkeranjang': cart_list,
        'daftarorder': order_list
    })


@app.route('/tambah')
def tambah():
    return render_template('tambahbuku.html')


@app.route("/tambahbuku", methods=["POST"])
def tambahbuku():
    judul_receive = request.form.get('judul_give')
    deskripsi_receive = request.form.get('deskripsi_give')
    harga_receive = int(request.form.get('harga_give'))
    stok_receive = int(request.form.get('stok_give'))
    kategori_receive = request.form.get('kategori_give')
    url_receive = request.form.get('url_give')

    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')

    # Ambil semua file gambar
    files = request.files.getlist("gambar_give[]")

    if not files or files[0].filename == "":
        return jsonify({'msg': 'Gambar tidak ditemukan!'})

    cover_list = []

    for index, file in enumerate(files):
        filename = secure_filename(file.filename)
        extension = filename.split(".")[-1].lower()

        if extension not in ['jpg', 'jpeg', 'png', 'webp']:
            return jsonify({'msg': f'File tidak valid: {filename}'})

        # Simpan sebagai: static/cover/url-name-<index>.ext
        folder_path = os.path.join("static", "cover")
        os.makedirs(folder_path, exist_ok=True)

        saved_name = f"{url_receive}-{index+1}.{extension}"
        save_path = os.path.join(folder_path, saved_name)
        file.save(save_path)

        # Simpan relative path ke DB
        cover_list.append(f"cover/{saved_name}")

    # Ambil gambar pertama sebagai thumbnail utama (opsional)
    cover_thumbnail = cover_list[0]

    doc = {
        'Date': mytime,
        'JudulBuku': judul_receive,
        'Deskripsi': deskripsi_receive,
        'Harga': harga_receive,
        'Stok': stok_receive,
        'Kategori': kategori_receive,
        'URL': url_receive,
        'Cover': cover_thumbnail,
        'AllCover': cover_list
    }

    db.barang.insert_one(doc)
    return jsonify({'msg': 'Inputan Berhasil!'})


@app.route("/profile")
def profile():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        username = payload.get('id')
        user_info = db.login.find_one({"username": username}, {"_id": False})
        return render_template("profile.html", user_info=user_info)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


@app.route('/update_profile', methods=["POST"])
def update_profile():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("id")

        email_receive = request.form.get("email_give")
        nomor_receive = request.form.get("nomor_give")
        alamat_receive = request.form.get("alamat_give")

        now = datetime.now(ZoneInfo("Asia/Jakarta"))
        mytime = now.strftime('%Y-%m-%d-%H-%M-%S')

        new_doc = {
            'email': email_receive,
            'nohp': nomor_receive,
            'alamat': alamat_receive
        }

        # Simpan foto profil
        if "file_give" in request.files:
            file = request.files.get("file_give")
            filename = secure_filename(file.filename)
            extension = filename.split(".")[-1]
            file_path = f"profile/{username}-{mytime}.{extension}"
            full_path = os.path.join("static", file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            file.save(full_path)
            new_doc['profile_default'] = file_path

            user_data = db.login.find_one({"username": username})
            old_path = user_data.get("profile_default", "")
            if old_path and old_path != file_path:
                old_file = os.path.join("static", old_path)
                if os.path.exists(old_file):
                    os.remove(old_file)

        db.login.update_one({"username": username}, {"$set": new_doc})
        return jsonify({"result": "success", "msg": "Profil berhasil diperbarui!"})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("/"))


@app.route('/favorite')
def favorite():
    return render_template('favorite.html')


@app.route('/showfav')
def showfav():
    user_receive = request.cookies.get("username")
    favorite_list = list(db.favorite.find(
        {'username': user_receive}, {'_id': False}))
    cart_list = list(db.cart.find({'username': user_receive}, {'_id': False}))
    book_list = []
    for i in favorite_list:
        judulfav = i["JudulBuku"]
        book_find = db.barang.find_one({"URL": judulfav}, {"_id": False})
        book_list.append(book_find)
    return jsonify({'daftarbuku': book_list, 'daftarfavorite': favorite_list, 'daftarkeranjang': cart_list})


@app.route('/fav', methods=["POST"])
def fav():
    judul_receive = request.form.get('judul_give')
    username_receive = request.form.get('username_give')
    action_receive = request.form.get('action_give')
    doc = {
        'JudulBuku': judul_receive,
        'username': username_receive,
        'status': 'favorited'
    }
    if action_receive == "favorited":
        db.favorite.insert_one(doc)
        return jsonify({'result': 'success', 'msg': action_receive})
    else:
        db.favorite.delete_one(doc)
        return jsonify({'result': 'success', 'msg': "terhapus dari favorite"})


@app.route('/cart')
def cart():
    return render_template('cart.html')


@app.route('/showcart')
def showcart():
    user_receive = request.cookies.get("username")
    cart_list = list(db.cart.find({'username': user_receive}, {'_id': False}))

    book_list = []

    for item in cart_list:
        judul_fav = item.get("JudulBuku")
        book_data = db.barang.find_one({"URL": judul_fav}, {"_id": False})

        if book_data:
            # Validasi & konversi stok ke integer
            try:
                stok = int(book_data.get('Stok', 0))
            except (ValueError, TypeError):
                stok = 0

            if stok > 0:
                # Gabungkan data keranjang dan buku (jika perlu)
                merged_data = item.copy()
                merged_data.update(book_data)
                book_list.append(merged_data)

    return jsonify({
        'daftarbuku': book_list,         # hanya yang stoknya > 0
        'daftarkeranjang': cart_list     # semua keranjang user
    })


@app.route('/addcart', methods=["POST"])
def addcart():
    judul_receive = request.form.get('judul_give')
    username_receive = request.form.get('username_give')
    action_receive = request.form.get('action_give')
    doc = {
        'JudulBuku': judul_receive,
        'username': username_receive,
        'status': 'dalam keranjang'
    }
    if action_receive == "Added to cart":
        db.cart.insert_one(doc)
        return jsonify({'result': 'success', 'msg': action_receive})
    else:
        db.cart.delete_one(doc)
        return jsonify({'result': 'success', 'msg': "terhapus dari keranjang"})


@app.route('/orderan', methods=['POST'])
def orderan():
    data = request.get_json()

    username_receive = data.get('username_give')
    pesanan_receive = data.get('pesanan_give')  # list of dicts

    if not username_receive or not pesanan_receive:
        return jsonify({'result': 'error', 'msg': 'Data tidak lengkap'}), 400

    order_id = f"ORDER-{username_receive}-{int(time.time())}"
    now = datetime.now(ZoneInfo("Asia/Jakarta"))
    mytime_str = now.strftime('%Y-%m-%d %H:%M:%S')

    items_to_save = []

    for item in pesanan_receive:
        judul = item.get('judul')
        jumlah = int(item.get('jumlah', 0))
        harga = int(item.get('harga', 0))

        if not judul or jumlah <= 0 or harga <= 0:
            continue  # Skip jika data tidak valid

        # Ambil cover dan AllCover dari koleksi barang
        book = db.barang.find_one({'JudulBuku': judul}, {
                                  '_id': False, 'Cover': True, 'AllCover': True})
        cover = book.get('Cover', '') if book else ''
        all_cover = book.get('AllCover', []) if book else []

        item.update({
            'order_id': order_id,
            'username': username_receive,
            'tanggal': mytime_str,
            'cover': cover,
            'AllCover': all_cover,
            'status': 'Belum Bayar',
            'waktu': now
        })

        items_to_save.append(item)

        # Kurangi stok
        db.barang.update_one({'JudulBuku': judul}, {'$inc': {'Stok': -jumlah}})

    if not items_to_save:
        return jsonify({'result': 'error', 'msg': 'Tidak ada item valid untuk disimpan'}), 400

    # Simpan ke koleksi orderan
    db.orderan.insert_many(items_to_save)

    # Hapus keranjang user
    db.cart.delete_many({'username': username_receive})

    return jsonify({
        'result': 'success',
        'msg': "Orderan diterima",
        'order_id': order_id,
        'jumlah_item': len(items_to_save)
    })


@app.route('/bayar', methods=['POST'])
def bayar():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        username = data.get('username_give')
        jumlah = data.get('jumlah_give')
        total = data.get('total_give')
        tanggal = data.get('tanggal_give')  # 🆕 terima tanggal dari frontend

        # Validasi input
        if not username or not jumlah or not total or not tanggal:
            return jsonify({
                "result": "error",
                "message": "Data tidak lengkap."
            }), 400

        try:
            jumlah = int(jumlah)
            total = int(total)
        except ValueError:
            return jsonify({
                "result": "error",
                "message": "Jumlah dan total harus berupa angka."
            }), 400

        # 🆕 Konversi tanggal dan set expiry Midtrans
        try:
            waktu_obj = datetime.strptime(tanggal, "%Y-%m-%d %H:%M:%S")
            start_time = waktu_obj.strftime(
                "%Y-%m-%d %H:%M:%S") + " +0700"  # WIB
        except ValueError:
            return jsonify({
                "result": "error",
                "message": "Format tanggal tidak valid."
            }), 400

        expiry_config = {
            "start_time": start_time,
            "unit": "hour",
            "duration": 24  # Bisa diubah ke "minute" dan 15 jika countdown pendek
        }

        order_id = f"ORDER-{username}-{int(time.time())}"

        transaction = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": total
            },
            "customer_details": {
                "first_name": username,
                "email": f"{username}@example.com"
            },
            "expiry": expiry_config  # 🆕 Tambahkan konfigurasi waktu kedaluwarsa
        }

        response = snap.create_transaction(transaction)
        snap_token = response.get('token')

        if not snap_token:
            raise Exception("Gagal mendapatkan Snap Token dari Midtrans.")

        return jsonify({
            "result": "success",
            "snap_token": snap_token,
            "order_id": order_id,
            "msg": "Silakan selesaikan pembayaran"
        })

    except Exception as e:
        logging.exception("Gagal memproses pembayaran:")
        return jsonify({
            "result": "error",
            "message": f"Terjadi kesalahan pada server: {str(e)}"
        }), 500


# @app.route('/payment-callback', methods=['POST'])
# def payment_callback():
#     try:
#         notification = request.get_json()
#         transaction_status = notification.get('transaction_status')
#         order_id = notification.get('order_id')

#         if not order_id:
#             return jsonify({'message': 'Order ID tidak ditemukan'}), 400

#         # Jika status pembayaran sukses, update status di DB
#         if transaction_status == 'settlement':  # pembayaran sukses
#             db.orderan.update_one(
#                 {'order_id': order_id},
#                 {'$set': {'status': 'Sudah Bayar'}}
#             )

#         elif transaction_status in ['cancel', 'deny', 'expire']:
#             db.orderan.update_one(
#                 {'order_id': order_id},
#                 {'$set': {'status': 'Dibatalkan'}}
#             )

#         return jsonify({'message': 'Notifikasi diproses'}), 200

#     except Exception as e:
#         logging.exception("Gagal memproses notifikasi Midtrans:")
#         return jsonify({'message': 'Server error'}), 500


@app.route('/orders')
def orders():
    return render_template('pesanan.html')


@app.route('/showorder')
def showorder():
    user_receive = request.cookies.get("username")
    now = datetime.now(ZoneInfo("Asia/Jakarta"))

    # Ambil semua pesanan user
    order_list = list(db.orderan.find(
        {'username': user_receive}, {'_id': False}))

    orders_list = []

    for order in order_list:
        # Pastikan ini disimpan sebagai datetime
        order_time = order.get('order_time')
        if order_time:
            # Jika order_time dalam format string ISO, ubah ke datetime
            if isinstance(order_time, str):
                order_time = datetime.fromisoformat(order_time)

            # Hapus pesanan jika sudah lebih dari 1 hari
            if now - order_time > timedelta(days=1):
                db.orderan.delete_one({'order_id': order['order_id']})
                continue  # Lewati penambahan ke list karena sudah dihapus

        order_detail = db.orderan.find_one(
            {'order_id': order['order_id']}, {'_id': False})
        if order_detail:
            orders_list.append(order_detail)

    return jsonify({'daftarorderan': orders_list, 'daftarorder': order_list})


@app.route('/hapus-pesanan', methods=['POST'])
def hapus_pesanan():
    order_id = request.form.get('order_id')

    if not order_id:
        return jsonify({'result': 'error', 'msg': 'Order ID tidak diberikan'}), 400

    result = db.orderan.delete_one({'order_id': order_id})

    if result.deleted_count == 1:
        return jsonify({'result': 'success', 'msg': 'Pesanan berhasil dihapus'})
    else:
        return jsonify({'result': 'error', 'msg': 'Pesanan tidak ditemukan atau gagal dihapus'}), 404


@app.route('/detail/<book>')
def detail(book):
    book_detail = db.barang.find_one({"URL": book}, {"_id": False})
    return render_template('detail.html', book_detail=book_detail)


@app.route('/edit/<book>')
def editbook(book):
    book_edit = db.barang.find_one({"URL": book}, {"_id": False})
    return render_template('editbook.html', book_edit=book_edit)


@app.route("/editcover", methods=["POST"])
def editcover():
    waktu = request.form.get('waktu_give')
    date = db.barang.find_one({"Date": waktu}, {"_id": False})

    if not date:
        return jsonify({'msg': 'Data tidak ditemukan!'})

    cover_old_list = date.get("AllCover", [])
    if isinstance(cover_old_list, str):
        cover_old_list = [cover_old_list]

    for old_path in cover_old_list:
        full_path = os.path.join("static", old_path)
        if os.path.exists(full_path):
            os.remove(full_path)

    files = request.files.getlist("gambar_give[]")
    if not files or files[0].filename == "":
        return jsonify({'msg': 'Gambar tidak ditemukan!'})

    cover_list = []
    url_receive = date["URL"]

    for index, file in enumerate(files):
        filename = secure_filename(file.filename)
        extension = filename.split(".")[-1].lower()

        if extension not in ['jpg', 'jpeg', 'png', 'webp']:
            return jsonify({'msg': f'File tidak valid: {filename}'})

        folder_path = os.path.join("static", "cover")
        os.makedirs(folder_path, exist_ok=True)

        saved_name = f"{url_receive}-{index+1}.{extension}"
        save_path = os.path.join(folder_path, saved_name)
        file.save(save_path)

        cover_list.append(f"cover/{saved_name}")

    new_doc = {
        "AllCover": cover_list
    }

    db.barang.update_one({"Date": waktu}, {"$set": new_doc})
    return jsonify({'msg': 'Update Cover Berhasil!'})


@app.route("/editbuku", methods=["POST"])
def editbuku():
    update_judul = request.form.get('judul_update')
    update_deskripsi = request.form.get('deskripsi_update')
    update_harga = int(request.form.get('harga_update'))
    update_stok = int(request.form.get('stok_update'))
    update_kategori = request.form.get('kategori_update')
    waktu = request.form.get('waktu_give')

    new_doc = {
        'JudulBuku': update_judul,
        'Deskripsi': update_deskripsi,
        'Harga': update_harga,
        'Stok': update_stok,
        'Kategori': update_kategori,
    }
    db.barang.update_one({"Date": waktu}, {"$set": new_doc})
    return jsonify({'msg': 'Update Detail Berhasil!'})


@app.route('/search/<kata>')
def search(kata):
    try:
        pola_regex = re.compile(f".*{kata}.*", re.IGNORECASE)
        hasil = list(db.barang.find(
            {"JudulBuku": {"$regex": pola_regex}}, {"_id": False}))
        for item in hasil:
            harga = item.get("Harga", 0)
            if isinstance(harga, (int, float)):
                item["HargaFormat"] = f"Rp.{harga:,.0f}".replace(",", ".")
            else:
                item["HargaFormat"] = "Rp.0"

        aqua = json_util.loads(json_util.dumps(hasil))

        # Ambil username dari cookie
        username = request.cookies.get('username')

        # Ambil data favorite dan cart
        daftarfav = db.favorite.find({'username': username}, {'_id': False})
        daftarfavorite = [fav['JudulBuku'] for fav in daftarfav]

        daftarcart = db.cart.find({'username': username}, {'_id': False})
        daftarkeranjang = [cart['JudulBuku'] for cart in daftarcart]

        return render_template(
            'search.html',
            hasil=aqua,
            kata=kata,
            daftarfavorite=daftarfavorite,
            daftarkeranjang=daftarkeranjang
        )

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("/"))


def hapus_pesanan_kadaluarsa():
    """
    Menghapus pesanan dari koleksi 'orderan' yang berstatus 'belum bayar'
    dan dibuat lebih dari 1 hari yang lalu.
    """
    try:
        batas_waktu = datetime.now(
            ZoneInfo("Asia/Jakarta")) - timedelta(days=1)
        hasil = db.orderan.delete_many({
            "status": "belum bayar",
            "waktu": {"$lt": batas_waktu}
        })
        print(
            f"{hasil.deleted_count} pesanan kadaluarsa berstatus 'belum bayar' telah dihapus.")
    except Exception as e:
        print(f"Terjadi kesalahan saat menghapus pesanan kadaluarsa: {e}")


# Inisialisasi scheduler (jangan dijalankan langsung di sini!)
scheduler = BackgroundScheduler()
scheduler.add_job(hapus_pesanan_kadaluarsa, 'interval', minutes=1)


@app.route('/simpan-wajah', methods=['POST'])
def simpan_wajah():
    try:
        data = request.json
        username = data.get('username')
        descriptor = data.get('descriptor')  # list of 128 floats

        if not username or descriptor is None:
            return jsonify({"result": "error", "msg": "Data tidak lengkap"}), 400

        save_dir = os.path.join('static', 'face_descriptors', username)
        os.makedirs(save_dir, exist_ok=True)

        # Simpan sebagai file NumPy
        filename = f"{username}_{len(os.listdir(save_dir))}.npy"
        filepath = os.path.join(save_dir, filename)
        np.save(filepath, np.array(descriptor))

        # Hapus descriptor lama jika lebih dari 5
        all_files = sorted(
            [f for f in os.listdir(save_dir) if f.endswith('.npy')],
            key=lambda x: os.path.getctime(os.path.join(save_dir, x))
        )

        if len(all_files) > 5:
            for old_file in all_files[:-5]:  # Sisakan 5 terakhir
                os.remove(os.path.join(save_dir, old_file))

        return jsonify({"result": "success", "msg": f"Descriptor disimpan sebagai: {filename}"})

    except Exception as e:
        return jsonify({"result": "error", "msg": f"Gagal menyimpan descriptor: {str(e)}"}), 500


@app.route('/verifikasi-wajah', methods=['POST'])
def verifikasi_wajah():
    try:
        data = request.json
        username = data.get('username')
        descriptor_client = np.array(data.get('descriptor'))  # array dari JS

        if not username or descriptor_client is None:
            return jsonify({"result": "error", "msg": "Data tidak lengkap"}), 400

        folder = os.path.join('static', 'face_descriptors', username)
        if not os.path.exists(folder):
            return jsonify({"result": "error", "msg": "Data descriptor tidak ditemukan"}), 404

        threshold = 0.6
        matched = False

        for filename in os.listdir(folder):
            if filename.endswith('.npy'):
                path = os.path.join(folder, filename)
                descriptor_saved = np.load(path)

                distance = np.linalg.norm(descriptor_saved - descriptor_client)
                if distance < threshold:
                    matched = True
                    break

        if matched:
            return jsonify({"result": "success", "msg": "✅ Wajah cocok, verifikasi berhasil."})
        else:
            return jsonify({"result": "error", "msg": "❌ Wajah tidak cocok."})

    except Exception as e:
        return jsonify({"result": "error", "msg": f"Error saat verifikasi: {str(e)}"}), 500


if __name__ == '__main__':
    if not is_running_from_reloader():
        scheduler.start()

    app.run(host='0.0.0.0', port=5000, debug=True)
