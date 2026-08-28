from flask import request,jsonify
from flask_login import login_user, logout_user,current_user,login_required

from app.auth import auth_bp
from app.extensions import db
from app.models import Usuario


@auth_bp.route('/me', methods=["GET"])
def me():
    if current_user.is_authenticated:
        return jsonify ({"autenticaçao": True, "id": current_user.id, "nome": current_user.nome}), 200
    return jsonify ({"autenticado": False}), 200

@auth_bp.route('/login', methods=["POST"])
def Login():
    data = request.json
    user = Usuario.query.filter_by(nome=data.get("nome")).first() # Filter_by Responsavel por fazer filtragem por nome especifico do Usuario
    
    if user and data.get("senha") == user.senha: # Validação do Usuario
        login_user(user)
        return jsonify({"mensagem":"Login Realizado Com Sucesso"}), 200
           
    return jsonify({"mensagem":"Credenciais Inválidas"}), 401

@auth_bp.route('/logout', methods = ["POST"])
def logout():
    logout_user()
    return jsonify({"mensagem":"Logout Realizado Com Sucesso"}), 200

@auth_bp.route('/register', methods = ['POST'])
def register():
    data = request.get_json(silent=True)
    if not data or 'nome' not in data or 'senha' not in data:
        return jsonify ({"mensagem":"Dados Invalido do Usuario"}), 400
        
    if Usuario.query.filter_by(nome=data['nome']).first():
      return jsonify ({"mensagem":"Usuario ja Existe"}), 400
        
    usuario = Usuario(nome=data['nome'], senha=data['senha'])
    db.session.add(usuario)
    db.session.commit()
    return jsonify ({"mensagem":"Usuario Cadastrado com Sucesso"}), 200


