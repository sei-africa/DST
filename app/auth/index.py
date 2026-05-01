from flask import Blueprint, render_template, request, flash, session
from flask import current_app as app
import json
from functools import wraps
from datetime import datetime as dt
from datetime import timedelta

from app.scripts._global import GLOBAL_CONFIG
from app.scripts._cache import cache
from .scripts import *

auth = Blueprint(
    'auth', __name__,
    template_folder = 'templates',
    static_folder = 'static',
    static_url_path = '/static/auth'
)

def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash('You need to login first', 'warning')
            dataUser = {'uid': -1}
            page_contorl = page_control_urlprefix()
            return render_template('main.html',
                                   error_login = True,
                                   dataUser = dataUser,
                                   pageCtrl = page_contorl,
                                   metInfo = GLOBAL_CONFIG['metInfo'])
    return wrap

@auth.route('/users_management')
@login_required
def users_management():
    date = dt.today()
    date = date + timedelta(days=1)
    date = date.strftime('%Y-%m-%d')
    dataUser = {
        'fullname': '',
        'institution': '',
        'email': '',
        'username': '',
        'password': '',
        'role': 'user',
        'access': 'climatology',
        'expiry': date,
        'extract': ['mapmpoints'],
        'analysis': [],
        'uid': -1
    }
    page_contorl = page_control_musers()
    return render_template('users-management.html',
                           dataUser = dataUser,
                           metInfo = GLOBAL_CONFIG['metInfo'],
                           pageCtrl = page_contorl)

@auth.route('/createUser', methods=['POST'])
@login_required
def createUser():
    dataUser = request.get_json()
    try:
        if dataUser['update']:
            out = editUser(dataUser)
        else:
            out = addUser(dataUser)
    except Exception as e:
        out = {'status': -1, 'message': str(e), 'code': 'error'}

    return json.dumps(out)

@auth.route('/deleteUser', methods=['POST'])
@login_required
def deleteUser():
    data = request.get_json()
    try:
        out = removeUser(data['uid'])
        return json.dumps(out)
    except Exception as e:
        return json.dumps({'message': str(e), 'code': 'error'})

@auth.route('/getUserList', methods = ['POST'])
@login_required
def getUserList():
    try:
        out = getAllUsersList()
        date = dt.today()
        date = date.strftime('%Y-%m-%d')
        return json.dumps({'status': 0, 'data': out, 'date': date})
    except Exception as e:
        return json.dumps({'status': -1, 'message': str(e)})

@auth.route('/getUserInfo')
@login_required
def getUserInfo():
    username = request.args.get('username')
    try:
        user = getUserData(username)[0]
        if user['fullname'] == 'null':
            msg = f'No information about user: {username}'
            return json.dumps({'status': -1, 'message': msg})
        else:
            return json.dumps({'status': 0, 'data': user})
    except Exception as e:
        return json.dumps({'status': -1, 'message': str(e)})

@auth.route('/login', methods = ['POST'])
def loginUser():
    username = request.form['username']
    password = request.form['password']
    # remember = True if request.form.get('remember') else False
    session['logged_in'] = False
    dataUser = {'uid': -1}
    page_contorl = page_control_urlprefix()
    try:
        ret = loginProc(username, password)
        if ret['status'] == -1:
            flash(ret['message'], 'error')
            return render_template('main.html',
                                   error_login = True,
                                   dataUser = dataUser,
                                   pageCtrl = page_contorl,
                                   metInfo = GLOBAL_CONFIG['metInfo'])
        else:
            flash('You are now logged in!', 'success')
            dataUser = ret['data']
            session['logged_in'] = True
            session['data'] = {
                'username': dataUser['username'],
                'expiry': dataUser['expiry'],
                'role': dataUser['role'],
                'access': dataUser['access'],
                'extract': dataUser['extract'],
                'analysis': dataUser['analysis'],
                'uid': dataUser['uid'],
                'api_key': dataUser['api_key']
            }
            return render_template('main.html',
                                   error_login = False,
                                   dataUser = dataUser,
                                   pageCtrl = page_contorl,
                                   metInfo = GLOBAL_CONFIG['metInfo'])
    except Exception as e:
        flash(str(e), 'error')
        return render_template('main.html',
                               error_login = True,
                               dataUser = dataUser,
                               pageCtrl = page_contorl,
                               metInfo = GLOBAL_CONFIG['metInfo'])

@auth.route('/logout')
@login_required
def logoutUser():
    session['logged_in'] = False
    session.pop('data', None)
    session.clear()
    dataUser = {'uid': -1}
    page_contorl = page_control_urlprefix()
    flash('You have been logged out!', 'success')
    return render_template('main.html',
                           error_login = False,
                           dataUser = dataUser,
                           pageCtrl = page_contorl,
                           metInfo = GLOBAL_CONFIG['metInfo'])

@auth.route('/user_account')
@cache.cached(timeout=60, key_prefix='user_')
@login_required
def user_account():
    username = session['data']['username']
    dataUser = getUserData(username)[0]
    page_contorl = page_control_musers()

    for col in ['multipoints', 'shapefiles', 'geojson']:
        dataUser[col] = getFilesUserData(username, col)

    return render_template('user-account.html',
                           dataUser = dataUser,
                           pageCtrl = page_contorl,
                           metInfo = GLOBAL_CONFIG['metInfo'])

@auth.route('/new_api_key')
@login_required
def new_api_key():
    username = request.args.get('username')
    pyobj = sql_generateAPIKey(username)
    return json.dumps(pyobj)

@auth.route('/change_password', methods = ['POST'])
@login_required
def change_password():
    user = request.get_json()
    pyobj = changePassword(user)
    return json.dumps(pyobj)

@auth.route('/forgot_password')
def forgot_password():
    dataUser = {'uid': -1}
    page_contorl = page_control_urlprefix()
    flash('An email has been sent to you', 'success')
    return render_template('main.html',
                           error_login = False,
                           dataUser = dataUser,
                           pageCtrl = page_contorl,
                           metInfo = GLOBAL_CONFIG['metInfo'])

@auth.route('/upload_user_files', methods = ['POST'])
@login_required
def upload_user_files():
    username = session['data']['username']
    colname = request.form['colname']
    if colname == 'shapefiles':
        userfiles = request.files.getlist('filesUser')
    else:
        userfiles = request.files['filesUser']

    shp = colname == 'shapefiles'
    pyobj = saveUserUploadedFile(username, userfiles, colname, shp)
    return json.dumps(pyobj)

@auth.route('/delete_user_files')
@login_required
def delete_user_files():
    username = session['data']['username']
    userfile = request.args.get("file")
    colname = request.args.get("colname")
    shp = colname == 'shapefiles'
    pyobj = deleteUserSavedFile(username, userfile, colname, shp)
    return json.dumps(pyobj)


