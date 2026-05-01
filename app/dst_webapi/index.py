from flask import Blueprint, render_template, request, session 
from flask import make_response, jsonify
from flask import current_app as app
import json

from app.scripts._global import GLOBAL_CONFIG
from app.scripts.page_ctrl import *
from app.auth.scripts import getFilesUserData, saveUserCSVFileMap
from app.auth.index import login_required
from app.dst_api.scripts import *

dst_webapi = Blueprint(
    'webapi', __name__,
    template_folder = 'templates',
    static_folder = 'static',
    static_url_path = '/static/dst_webapi'
)

dataUser = dict()

@dst_webapi.before_request
def before_request():
    global dataUser
    if 'logged_in' not in session:
        dataUser = {'uid': -1}
    else:
        if session['logged_in']:
            dataUser = session['data']
        else:
            dataUser = {'uid': -1}

@dst_webapi.route('/get_usermpoints')
@login_required
def get_usermpoints():
    if dataUser['uid'] < 0:
        usermpts = {'status': -1, 'message': 'You have to login first.'}
    else:
        userdata = getFilesUserData(dataUser['username'], 'multipoints')
        usermpts = {'status': 0, 'mpts': userdata}
    return json.dumps(usermpts)

@dst_webapi.route('/read_usermpoints')
@login_required
def read_usermpoints():
    csvfile = request.args.get('csvfile')
    pyob = get_user_csvfile(csvfile, dataUser['username'])
    return json.dumps(pyob)

@dst_webapi.route('/save_usermpoints', methods=['POST'])
@login_required
def save_usermpoints():
    user_req = request.get_json()
    ret = saveUserCSVFileMap(dataUser['username'], user_req)
    return json.dumps(ret)

@dst_webapi.route('/get_defaultpolygons')
@login_required
def get_defaultpolygons():
    if dataUser['uid'] < 0:
        msg = 'You have to login first.'
        shp_list = {'status': -1, 'message': msg}
    else:
        shp_list = get_list_polygons_app()
    return json.dumps(shp_list)

@dst_webapi.route('/read_defaultpolygons')
@login_required
def read_defaultpolygons():
    shpfile = request.args.get('shpfile')
    pyobj = get_defaut_polygons(shpfile)
    return json.dumps(pyobj)

@dst_webapi.route('/get_userpolygons')
@login_required
def get_userpolygons():
    if dataUser['uid'] < 0:
        msg = 'You have to login first.'
        shp_list = {'status': -1, 'message': msg}
    else:
        userdata = getFilesUserData(dataUser['username'], 'shapefiles')
        shp_list = {'status': 0, 'shp': userdata}
    return json.dumps(shp_list)

@dst_webapi.route('/read_userpolygons')
@login_required
def read_userpolygons():
    shpfile = request.args.get('shpfile')
    pyob = get_user_polygons(shpfile, dataUser['username'])
    return json.dumps(pyob)

@dst_webapi.route('/get_usergeojson')
@login_required
def get_usergeojson():
    if dataUser['uid'] < 0:
        userjson = {'status': -1, 'message': 'You have to login first.'}
    else:
        userdata = getFilesUserData(dataUser['username'], 'geojson')
        userjson = {'status': 0, 'geojs': userdata}
    return json.dumps(userjson)

@dst_webapi.route('/read_usergeojson')
@login_required
def read_usergeojson():
    jsonfile = request.args.get('jsonfile')
    pyob = get_user_geojson(jsonfile, dataUser['username'])
    return json.dumps(pyob)

#########

@dst_webapi.route('/download_raw')
@login_required
def download_raw():
    page_contorl = page_control_raw()
    return render_template('download-raw.html',
                           dataUser = dataUser,
                           pageCtrl = page_contorl,
                           metInfo = GLOBAL_CONFIG['metInfo'])

@dst_webapi.route('/download_climatology')
def download_climatology():
    page_contorl = page_control_climatology()
    return render_template('download-climatology.html',
                           dataUser = dataUser,
                           pageCtrl = page_contorl,
                           metInfo = GLOBAL_CONFIG['metInfo'])

@dst_webapi.route('/download_analysis')
def download_analysis():
    page_contorl = page_control_analysis()
    return render_template('download-analysis.html',
                           dataUser = dataUser,
                           pageCtrl = page_contorl,
                           metInfo = GLOBAL_CONFIG['metInfo'])

