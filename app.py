from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import os
from functools import wraps
from flask_mail import Mail, Message
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///books.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com' 
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@example.com'
app.config['MAIL_PASSWORD'] = 'your-email-password'
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@gmail.com'

db = SQLAlchemy(app)
mail = Mail(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    access_token = db.Column(db.String(200), unique=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    access_level = db.Column(db.Integer, default=1)  # 1 = free, 2 = premium, etc.

# Email verification function
def send_verification_email(email, token):
    try:
        verification_url = f"http://localhost:3000/verify-email?token={token}"
        msg = Message(
            "Verify Your Email",
            recipients=[email],
            html=f"""
            <h1>Welcome to Book Website</h1>
            <p>Please click the link below to verify your email:</p>
            <a href="{verification_url}">Verify Email</a>
            <p>Or copy this URL: {verification_url}</p>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False
# Decorators
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        access_token = request.headers.get('Authorization')
        if not access_token:
            abort(401)
        
        user = User.query.filter_by(access_token=access_token).first()
        if not user or not user.is_admin:
            abort(403)
            
        return f(*args, **kwargs)
    return decorated_function

# Auth Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400
    email = data.get('email')
    password = data.get('password')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    access_token = str(uuid.uuid4())
    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        access_token=access_token
    )
    db.session.add(new_user)
    email_sent = send_verification_email(email, access_token)
  
    if not email_sent:
        db.session.rollback()  # Undo the user creation
        return jsonify({'error': 'Failed to send verification email'}), 500
    db.session.commit()
    return jsonify({
        'message': 'User registered successfully. Please check your email for verification.',
        'access_token': access_token
    }), 201
    
    # Send verification email
    if not send_verification_email(email, access_token):
        return jsonify({'error': 'Failed to send verification email'}), 500
    
    return jsonify({
        'message': 'User registered successfully. Please check your email for verification.',
        'access_token': access_token
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email first'}), 403
    
    return jsonify({
        'message': 'Login successful',
        'access_token': user.access_token,
        'is_admin': user.is_admin
    }), 200

@app.route('/api/verify-email', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    user = User.query.filter_by(access_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid token'}), 400
    
    if user.is_verified:
        return jsonify({'message': 'Email already verified'}), 200
    
    user.is_verified = True
    db.session.commit()
    
    return jsonify({'message': 'Email verified successfully'}), 200

# Book Routes
@app.route('/api/books', methods=['GET'])
def get_books():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({'error': 'Access token required'}), 401
    
    user = User.query.filter_by(access_token=access_token).first()
    if not user:
        return jsonify({'error': 'Invalid access token'}), 401
    
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email first'}), 403
    
    books = Book.query.all()
    book_list = [{'id': book.id, 'title': book.title} for book in books]
    return jsonify(books=book_list), 200

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({'error': 'Access token required'}), 401
    
    user = User.query.filter_by(access_token=access_token).first()
    if not user:
        return jsonify({'error': 'Invalid access token'}), 401
    
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email first'}), 403
    
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    if book.access_level > 1 and not user.is_admin:
        return jsonify({'error': 'Unauthorized access to premium content'}), 403
    
    return jsonify({
        'id': book.id,
        'title': book.title,
        'content': book.content
    }), 200

# Admin Routes
@app.route('/api/admin/books', methods=['POST'])
@admin_required
def add_book():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    access_level = data.get('access_level', 1)
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
    
    new_book = Book(
        title=title,
        content=content,
        access_level=access_level
    )
    db.session.add(new_book)
    db.session.commit()
    
    return jsonify({
        'message': 'Book added successfully',
        'book_id': new_book.id
    }), 201

@app.route('/api/admin/books/<int:book_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    if request.method == 'PUT':
        data = request.get_json()
        book.title = data.get('title', book.title)
        book.content = data.get('content', book.content)
        book.access_level = data.get('access_level', book.access_level)
        db.session.commit()
        return jsonify({'message': 'Book updated successfully'}), 200
    
    elif request.method == 'DELETE':
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Book deleted successfully'}), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    user_list = [{
        'id': user.id,
        'email': user.email,
        'is_verified': user.is_verified,
        'is_admin': user.is_admin
    } for user in users]
    return jsonify(users=user_list), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(is_admin=True).first():
            admin_user = User(
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                access_token=str(uuid.uuid4()),
                is_verified=True,
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
    app.run(debug=True)