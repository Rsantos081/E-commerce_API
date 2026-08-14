from flask_login import UserMixin
from app.extensions import db

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