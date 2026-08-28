import os
from flask import Flask,jsonify, render_template
from flask_cors import CORS
from app.extensions import db, login_manager

def create_app():
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='../static',
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-trocar-em-produçao')
    
    CORS(
        app,
        supports_credentials= True,
        origins=['http://127.0.0.1:8000', 'http://localhost:8000']   
    )
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify ({"mensagem":"E necessario estar autenticado"}), 401
    
    from app.models import Usuario
     
    @login_manager.user_loader
    def load_user(usuario_id):
        return Usuario.query.get(int(usuario_id))
    
    from app.auth import auth_bp
    from app.src import produtos_bp
    from app.src import cart_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(produtos_bp)
    app.register_blueprint(cart_bp)
    
    with app.app_context():
        db.create_all()
        
    return app