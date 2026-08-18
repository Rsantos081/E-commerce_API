from flask import Blueprint

produtos_bp = Blueprint('products',__name__,url_prefix='/api/products')

from app.src import routes