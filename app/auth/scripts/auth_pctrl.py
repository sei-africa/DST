import os
import config
from app.scripts._global import GLOBAL_CONFIG
from app.scripts.util import load_yaml_file

def page_control_musers():
    dir_app = GLOBAL_CONFIG['app_dir']
    dir_yaml = os.path.join(dir_app, 'auth', 'yaml')
    yaml_file = os.path.join(dir_yaml, 'user-creation.yaml')
    page_contorl = load_yaml_file(yaml_file)
    webapi_yaml = os.path.join(dir_app, 'dst_webapi', 'yaml')
    extract_file = os.path.join(webapi_yaml, 'extraction-support.yaml')
    page_contorl.update(load_yaml_file(extract_file))
    analysis_file = os.path.join(webapi_yaml, 'download-analysis.yaml')
    analysis = load_yaml_file(analysis_file)
    page_contorl['analysis'] = analysis['analysis']
    page_contorl['urlPrefix'] = config.URL_PREFIX
    return page_contorl

def page_control_urlprefix():
    page_contorl = {'urlPrefix': config.URL_PREFIX}
    return page_contorl

def _get_admin_datauser():
    admin = {}
    admin['fullname'] = 'DST Administrator'
    admin['institution'] = 'NMHS'
    admin['email'] = 'adminDST@localhost'
    admin['username'] = 'admin'
    admin['password'] = 'admin'
    admin['role'] = 'admin'
    admin['access'] = 'all'
    admin['expiry'] = '2100-01-01'
    pgc = page_control_musers()
    admin['extract'] = list(pgc['extraction_support'].keys())
    admin['analysis'] = list(pgc['analysis'].keys())
    return {'status': 0, 'user': admin}
