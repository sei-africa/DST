import os
import sys
from app.dst_api.scripts.zarrdata import create_computed_zarr_datasets

def main():
    create_computed_zarr_datasets()
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)

if __name__ == '__main__':
    main()
