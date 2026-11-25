import os
import sys
from app.dst_api.scripts.zarrclim import compute_some_climatogies

def main():
    compute_some_climatogies('mean-stdev')
    compute_some_climatogies('percentile')
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)

if __name__ == '__main__':
    main()
