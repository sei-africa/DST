from flask import Flask, render_template, flash, session
# from flask_jsglue import JSGlue
from flask_cors import CORS

app = Flask(__name__, instance_relative_config = False)
app.config.from_object('config')
# jsglue = JSGlue(app)
CORS(app)

####
from app.auth.index import auth
from app.dst_webapi.index import dst_webapi
from app.dst_api.index import dst_api

app.register_blueprint(auth)
app.register_blueprint(dst_webapi)
app.register_blueprint(dst_api)

####
import config
from app.scripts._global import GLOBAL_CONFIG
from app.auth.scripts.sqlite import initUsersTable
from app.scripts._cache import cache
cache.init_app(app)

try:
    ret = initUsersTable()
    if ret['status'] == -1:
        flash(ret['message'], 'error')
except Exception as e:
    flash(str(e), 'error')

@app.before_request
def before_request():
    global dataUser
    if 'logged_in' not in session:
        dataUser = {'uid': -1}
    else:
        if session['logged_in']:
            dataUser = session['data']
        else:
            dataUser = {'uid': -1}

@app.route('/')
def homepage():
    metservice = GLOBAL_CONFIG['metInfo']['metServiceLongname']
    flash(f'Welcome to {metservice}', 'info')
    page_contorl = {'urlPrefix': config.URL_PREFIX}
    return render_template('main.html',
                           error_login=False,
                           dataUser=dataUser,
                           pageCtrl=page_contorl,
                           metInfo=GLOBAL_CONFIG['metInfo'])

@app.route('/get_flashes')
def get_flashes():
    return render_template('flashes.html')

@app.route('/info')
def api_info():
    import os
    import json
    import datetime
    from app.scripts.util import load_yaml_file
    from app.dst_api.scripts.util import response_download_json
    info_file = os.path.join(GLOBAL_CONFIG['app_dir'], 'yaml', 'info.yaml')
    info = load_yaml_file(info_file)
    info['environment'] = os.getenv('ENV', 'production')
    info['server_time'] = datetime.datetime.now(datetime.UTC).isoformat(timespec='seconds') + 'Z'
    return response_download_json(info, 'dst-info')

@app.route('/api_documentation')
def api_documentation():
    import os
    import markdown
    md_file = os.path.join(GLOBAL_CONFIG['app_dir'], 'markdown', 'documentation.md')
    with open(md_file, 'r', encoding='utf-8') as file:
        md_content = file.read()
    html_content = markdown.markdown(md_content, extensions=['extra', 'toc'])
    doc_toc, doc_body = separate_toc_body(html_content)
    doc_body = doc_body.replace('<<<<urlPrefix>>>>', config.URL_PREFIX)
    page_contorl = {'urlPrefix': config.URL_PREFIX}
    return render_template('documentation.html',
                           dataUser=dataUser,
                           pageCtrl=page_contorl,
                           metInfo=GLOBAL_CONFIG['metInfo'],
                           docToc=doc_toc,
                           docBody=doc_body)

def separate_toc_body(html):
    import re

    rtag = r'<p>separate_toc_tag</p>\n'
    match = re.search(rtag, html)
    index = match.span()
    ix1 = index[0] - 1
    ix2 = index[1]
    return html[0:ix1], html[ix2:]
