import os
import config
from .util import load_yaml_file

GLOBAL_CONFIG = {}
scripts_dir = os.path.dirname(os.path.realpath(__file__))
app_dir = os.path.dirname(scripts_dir)
GLOBAL_CONFIG['app_dir'] = app_dir

GLOBAL_CONFIG['data_dir'] = config.DST_DATA_DIR
GLOBAL_CONFIG['app_cache'] = os.path.join(config.DST_DATA_DIR, 'app_cache')
if not os.path.exists(GLOBAL_CONFIG['app_cache']):
    os.makedirs(GLOBAL_CONFIG['app_cache'])
GLOBAL_CONFIG['users_data'] = os.path.join(config.DST_DATA_DIR, 'users_data')
if not os.path.exists(GLOBAL_CONFIG['users_data']):
    os.makedirs(GLOBAL_CONFIG['users_data'])
GLOBAL_CONFIG['shp_dir'] = os.path.join(config.DST_DATA_DIR, 'shp')
if not os.path.exists(GLOBAL_CONFIG['shp_dir']):
    os.makedirs(GLOBAL_CONFIG['shp_dir'])

met_file = os.path.join(app_dir, 'yaml', 'metService.yaml')
GLOBAL_CONFIG['metInfo'] = load_yaml_file(met_file)

config_data_file = os.path.join(app_dir, 'yaml', 'datasets-config.yaml')
GLOBAL_CONFIG.update(load_yaml_file(config_data_file))
