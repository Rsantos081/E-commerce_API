from flask import Flask, request,jsonify
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
swagger = Swagger(app, template_file="swagger.yaml")

login_manager = LoginManager() # Biblioteca Responsavel por controlar o acesso do Usuario
db = SQLAlchemy(app) 
login_manager.init_app(app)
login_manager.login_view = 'login' 
   
class Usuario(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False, unique=True) 
    senha = db.Column(db.String(80), nullable=False)
    carrinho = db.relationship('ItemCarrinho', backref='usuario', lazy=True)
      
class Produto(db.Model): 
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    preco = db.Column(db.Float, nullable=False)
    descricao = db.Column(db.String(255),nullable=True)
        
class ItemCarrinho(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'), nullable=False)
        
# Autenticacao
@login_manager.user_loader
def load_user(usuario_id):
    return Usuario.query.get(int(usuario_id))
 
@app.route ('/login', methods=["POST"])
def Login():
    data = request.json
    user = Usuario.query.filter_by(nome=data.get("nome")).first() # Filter_by Responsavel por fazer filtragem por nome especifico do Usuario
    
    if user and data.get("senha") == user.senha: # Validação do Usuario
        login_user(user)
        return jsonify({"mensagem":"Login Realizado Com Sucesso"}), 200
           
    return jsonify({"mensagem":"Credenciais Inválidas"}), 401

@app.route ('/logout', methods = ["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"mensagem":"Login Realizado Com Sucesso"}), 200
 

@app.route('/api/products/add',methods=["POST"])
@login_required
def add_produto():
    data = request.json 
    if 'nome' in data and 'preco' in data: 
        product = Produto(nome=data["nome"],preco=data["preco"],descricao=data["descricao"])
        db.session.add(product)
        db.session.commit()
        return jsonify({"mensagem":"Produto Adicionado com Sucesso"}), 200
    return jsonify({"mensagem":"Dados do Produto Inválido"}), 400

@app.route('/api/products/delete/<int:product_id>', methods=["DELETE"])
@login_required
def delete_produto(product_id):
    product  = Produto.query.get(product_id)
    if product: # Condição para saber se o ID inserido e valido para acontecer o Delete
        db.session.delete(product)
        db.session.commit()
        return jsonify ({"mensagem": "Produto Deletado com Sucesso"}), 200
    return jsonify ({"mensagem": "Produto não Encontrado"}), 400

@app.route('/api/products/<int:product_id>', methods=["GET"])
def get_produto(product_id):
    product = Produto.query.get(product_id)# Busca na tabela Produto o registro que possui o ID informado
    if product:
        return jsonify({ 
            "id":product.id, 
            "nome":product.nome,
            "preco":product.preco,
            "descricao":product.descricao 
        })
    return jsonify ({"mensagem": "Produto não Encontrado"}), 404

@app.route('/api/products/update/<int:product_id>', methods = ["PUT"])
@login_required
def atualizar_produto(product_id):
    product = Produto.query.get(product_id)
    if not product: # Condição para checar se o ID e valido ou não para atualizações
        return jsonify ({"mensagem":"Produto não Encontrado"}), 404
    data = request.json
    if 'nome' in data:
        product.nome = data['nome']
        
    if 'preco' in data:
        product.preco = data['preco']
        
    if 'descricao' in data:
        product.descricao = data['descricao']    
    db.session.commit()
    return jsonify ({"mensagme": "Produto Atualizado com Sucesso"}), 200

@app.route('/api/products', methods = ["GET"])
def get_produtos():
    products = Produto.query.all() 
    products_list = []
    for product in products: # Variavel product recebe um registro da tabela(Produto) por vez em cada repetição do For
            product_data = {
                "id":product.id, 
                "nome":product.nome,
                "preco":product.preco,
            }
            products_list.append(product_data)
    return jsonify(products_list)


@app.route('/api/cart/add/<int:product_id>', methods = ['POST'])
@login_required
def add_carrinho(product_id):
    user = Usuario.query.get(int(current_user.id))
    product = Produto.query.get(product_id)
    
    if user and product:
        cart_item = ItemCarrinho(usuario_id=user.id, produto_id=product.id)
        db.session.add(cart_item)
        db.session.commit()
        return jsonify ({"mensagem":"Item Adicionado ao Carrinho com Sucesso"}), 200
    return jsonify ({"mensagem":"Item não Encontrado Credenciais Inválidas"}), 400

@app.route('/api/cart/remove/<int:product_id>', methods = ["DELETE"])
@login_required
def delete_carrinho(product_id):
    cart_item = ItemCarrinho.query.filter_by(usuario_id=current_user.id, produto_id=product_id).first()
    if cart_item:
        db.session.delete(cart_item)
        db.session.commit()
        return jsonify ({"mensagem":"Item Removido do Carrinho com Sucesso"}), 200
    return jsonify ({"mensagem": "Falha ao Remover o Item do Carrinho"}), 400
        
@app.route('/api/cart', methods = ["GET"])
@login_required
def visualizar_carrinho():
    user = Usuario.query.get(int(current_user.id))
    cart_items = user.carrinho
    cart_content = []
    for cart_item in cart_items:
        product = Produto.query.get(cart_item.produto_id)
        cart_content.append({
                "id": cart_item.id,
                "product_id": cart_item.produto_id,
                "user_id": cart_item.usuario_id,
                "product_name": product.nome
            })
    return jsonify (cart_content)

@app.route ('/api/cart/checkout', methods = ["POST"])
@login_required
def checkout():
    user = Usuario.query.get(current_user.id)
    cart_items = user.carrinho
    for cart_item in cart_items:
        db.session.delete(cart_item)
    db.session.commit()
    return jsonify ({"mensagem":"Finalização da Compra Bem-Sucedida. Carinho Esvaziado"}), 200

if __name__ == "__main__":
    app.run(debug=True)
