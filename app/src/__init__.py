from flask import Blueprint

produtos_bp = Blueprint('products',__name__,url_prefix='/api/products')
cart_bp = Blueprint('cart',__name__,url_prefix='/cart')
from app.src import routes