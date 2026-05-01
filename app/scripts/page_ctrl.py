import os
import config
from ._global import GLOBAL_CONFIG
from .util import load_yaml_file
from app.dst_api.scripts import get_datasets_information

def page_control_raw():
    dir_yaml = os.path.join(GLOBAL_CONFIG['app_dir'], 'dst_webapi', 'yaml')
    yaml_file = os.path.join(dir_yaml, 'download-raw.yaml')
    page_contorl = load_yaml_file(yaml_file)
    extract_file = os.path.join(dir_yaml, 'extraction-support.yaml')
    page_contorl.update(load_yaml_file(extract_file))
    output_file = os.path.join(dir_yaml, 'output-format.yaml')
    page_contorl.update(load_yaml_file(output_file))
    page_contorl['urlPrefix'] = config.URL_PREFIX
    page_contorl['dataInfo'] = get_datasets_information()
    return page_contorl

def page_control_climatology():
    dir_yaml = os.path.join(GLOBAL_CONFIG['app_dir'], 'dst_webapi', 'yaml')
    yaml_file = os.path.join(dir_yaml, 'download-climatogy.yaml')
    page_contorl = load_yaml_file(yaml_file)
    extract_file = os.path.join(dir_yaml, 'extraction-support.yaml')
    page_contorl.update(load_yaml_file(extract_file))
    output_file = os.path.join(dir_yaml, 'output-format.yaml')
    page_contorl.update(load_yaml_file(output_file))
    page_contorl['urlPrefix'] = config.URL_PREFIX
    page_contorl['dataInfo'] = get_datasets_information()
    return page_contorl

def page_control_analysis():
    dir_yaml = os.path.join(GLOBAL_CONFIG['app_dir'], 'dst_webapi', 'yaml')
    yaml_file = os.path.join(dir_yaml, 'download-analysis.yaml')
    page_contorl = load_yaml_file(yaml_file)
    raw_file = os.path.join(dir_yaml, 'download-raw.yaml')
    page_contorl.update(load_yaml_file(raw_file))
    extract_file = os.path.join(dir_yaml, 'extraction-support.yaml')
    page_contorl.update(load_yaml_file(extract_file))
    output_file = os.path.join(dir_yaml, 'output-format.yaml')
    page_contorl.update(load_yaml_file(output_file))
    page_contorl['urlPrefix'] = config.URL_PREFIX
    page_contorl['dataInfo'] = get_datasets_information()
    return page_contorl
