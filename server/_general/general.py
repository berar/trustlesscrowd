import numpy as np
import pandas as pd
from functools import reduce
from datetime import datetime, timedelta
from multiprocessing import Pool
import os, csv, json, sys, time, gzip, pickle #, ciso8601
import os.path
#import compress_pickle as cp
from functools import wraps
import functools
import requests
#from math import isclose

##################################################################################
### Logging functions
##################################################################################

# NOTE no need when running as: python3 -m unittest -v module
# NOTE also, to exit on first fail: python3 -m unittest -vf module
def print_f__name__(f):
    @wraps(f)
    def wrapped_f(*args, **kwargs):
        print('\n%s -------' % f.__name__)
        return f(*args, **kwargs)
    return wrapped_f

# TODO implement, document properly
def print_f__name__and_obj_on_fail(f):
    """Prints the name of the function before executing it, checks for resulting failure and if any, prints out the object.
    Used for unit-testing debugging. Wrapped function must return a (assertion,object) tuple."""
    @wraps(f)
    def wrapped_f(*args, **kwargs):
        print('\n%s -------' % f.__name__)
        assert_and_obj = f(*args, **kwargs)
        print('hi')
        pass
    return wrapped_f

##################################################################################
### Multi-threading functions
##################################################################################

def exec_pool(func, arg_list, thread_count=6):
    pool = Pool(thread_count)
    res_list = pool.map(func, arg_list)
    pool.close()
    pool.join()
    return res_list

def synchronized(lock):
    """ Synchronization decorator """
    def wrap(f):
        @functools.wraps(f)
        def newFunction(*args, **kw):
            with lock:
                return f(*args, **kw)
        return newFunction
    return wrap

##################################################################################
### datetime functions
#### TODO
##### 1. def is_date_diff_more_than_1h(cDate, pDate):    return divmod((datetime.strptime(cDate, '%Y-%m-%d %H:%M:%S') - datetime.strptime(pDate, '%Y-%m-%d %H:%M:%S')).total_seconds(), 3600)[0] > 1.0
##################################################################################

def curr_ts():
    return int(time.time())

def strtots(d, format='%Y-%m-%d %H:%M:%S', milis=False):
    return tots(strpdatetime(d, format=format), milis=milis)

def tots(d, milis=False):
    return int((d - datetime(1970, 1, 1)).total_seconds() * (1000 if milis else 1))

def fromts(ts):
    return datetime.utcfromtimestamp(ts)

def timestamp2str(ts, format='%Y-%m-%d %H:%M:%S'):
    return datetime.utcfromtimestamp(ts).strftime(format)

def strpdatetime(s, format='%Y-%m-%d %H:%M:%S', ciso=True):
    return ciso8601.parse_datetime(s) if ciso else datetime.strptime(s, format)

def strpdatetime_or_none(s):
    return try_or_none(strpdatetime, s)

def date_gen(stDates, enDates):
    for stDate in stDates:
        for enDate in enDates:
            if stDate >= enDate:
                continue
            yield (stDate, enDate)

def daterange(start, end, step=timedelta(hours=1)):
    curr = start
    while curr <= end:
        yield curr
        curr += step

def daterange_inv(start, end, step=timedelta(hours=1)):
    curr = end
    while curr >= start:
        yield curr
        curr -= step

def hour_diff(ld, ed):
     return int(divmod((ld - ed).total_seconds(), 3600)[0])

def day_diff(ld, ed):
    return int(divmod((ld - ed).total_seconds(), 60*60*24)[0])

##################################################################################
### Higher order functions for sequences / iterables
##################################################################################

def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def eq_ld(l1, l2):
    return set(tuple(sorted(d.items())) for d in l1)==set(tuple(sorted(d.items())) for d in l2)

def cmp(a, b):
    return (a > b) - (a < b)

def foreach(func, iterable, cont_pred=lambda x: False):
    """Apply func for each item in an iterable. Should be used with pure function."""
    for item in iterable:
        if cont_pred(item):
            continue
        func(item)

def identity(x):
    return x

def list_diff(aList,bList):
    return [aList[i] for i,t in enumerate([any([a==b for b in bList]) for a in aList]) if not t]

def find_min(lst):
    return reduce(lambda x,y: x if x<y else y, lst)

def find_max(lst):
    return reduce(lambda x,y: x if x>y else y, lst)

def find_first_id(iterable, default=-1, pred=None):
    return next((i for i,x in enumerate(iterable) if pred(x)), default)

def find_first(iterable, default=False, pred=None):
    """Returns the first true value in the iterable.

    If no true value is found, returns *default*

    If *pred* is not None, returns the first item
    for which pred(item) is true.

    """
    # first_true([a,b,c], x) --> a or b or c or x
    # first_true([a,b], x, f) --> a if f(a) else b if f(b) else x
    return next(filter(pred, iterable), default)

##################################################################################
### Math functions
##################################################################################

def almost_equal(a,b,abs_tol=10**-4):
    return isclose(a, b, abs_tol=10**-4)

# TODO implement raise
def safe_div(a,b,default=0.,ex=False):
    return a/b if b>0. else default

def mean(l):
    size = float(len(l))
    return sum(l) / size if size > 0. else float('NaN')

DEFAULT_OUTLIER_THRESHOLD = 6

def outliers(in_l, threshold=DEFAULT_OUTLIER_THRESHOLD):
    mean = np.mean(in_l)
    std = np.std(in_l)
    # z_score=(x-mean)/std
    return [x for x in in_l if abs(x-mean)/std>threshold] if std != 0. else []

def outlier_ids(in_l, threshold=DEFAULT_OUTLIER_THRESHOLD):
    mean = np.mean(in_l)
    std = np.std(in_l)
    # z_score=(x-mean)/std
    return [id for id,x in enumerate(in_l) if abs(x-mean)/std>threshold] if std != 0. else []

def remove_outliers(in_l, threshold=DEFAULT_OUTLIER_THRESHOLD):
    return list_diff(in_l, outliers(in_l, threshold=threshold))

##################################################################################
### Data structure functions
##################################################################################

# Given a list of dictonaries (list(k=>v)), turn into dictonary of lists (k=>list(v))
def ld2dl(ld):
    return {k:[d[k] for d in ld] for k in ld[0].keys()}

def dl2ld(dl):
    return [{ k:dl[k][id] for k in dl.keys() } for id,d in enumerate(dl[dl.keys()[0]])]

def distinct(l):
    return list(set(l))

# TODO
'''
def lapply(il, func):
    #return [func(d) for d in il]
    ol = []
    for d in il:
        ol.append(func(d))
    return ol
'''

##################################################################################
### String functions
##################################################################################

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def str_color(s, color=bcolors.HEADER):
    return '%s%s%s' % (color,s,bcolors.ENDC)

def str_green(s):
    return str_color(s, color=bcolors.OKGREEN)

def is_numeric(s):
    return s.replace('.','',1).isdigit()

##################################################################################
### File system functions, data extracting and loading
##################################################################################

def isdir(d):
    return os.path.isdir(d)

def file_exists(fpath):
    return os.path.isfile(fpath)

def files_exist(fpaths):
    return all(map(file_exists, fpaths))

def mkdir(idir):
    if not os.path.exists(idir):
        os.makedirs(idir)
    return idir

def printf(fpath, func):
    orig_stdout = sys.stdout
    f = open(fpath, 'w')
    sys.stdout = f
    func()
    sys.stdout = orig_stdout
    f.close()

def printfs(fpath, content):
    text_file = open(fpath, "w")
    text_file.write(content)
    text_file.close()

def readfs(fpath):
    f = open(fpath, "r")
    content = f.read()
    f.close()
    return content

def list_fnames(dir, ext='csv', filter_func=identity):
    return [x.replace('.'+ext, '') for x in [f for r, d, f in os.walk(dir if dir.endswith('/') else (dir+'/'))][0] if x.endswith('.'+ext) and filter_func(x)]

def load_ndarray(csvFilePath, nda):
    with open(csvFilePath, 'w') as csvFile:
        writer = csv.writer(csvFile)
        writer.writerows(nda)
    csvFile.close()

def extract_ndarray(filePath, header=True):
    result = []
    with open(filePath, 'r') as file:
        L = [line.split(',') for line in file.readlines()]
        result = np.array(L)[1 if header else 0:].astype('object')
    file.close()
    return result

# Store a list of dictonaries
def save_ld(cfpath, lst):
    with open(cfpath, 'w', newline='') as output_file:
        dict_writer = csv.DictWriter(output_file, lst[0].keys())
        dict_writer.writeheader()
        dict_writer.writerows(lst)
    output_file.close()

def save_headers(cfpath, headers):
    with open(cfpath, 'w') as output_file:
        dict_writer = csv.DictWriter(output_file, headers)
        dict_writer.writeheader()
    output_file.close()

#TODO safe function to all have 'safe' as infix, not suffix
def save_ld_safe(cfpath, lst, headers):
    if lst:
        save_ld(cfpath, lst)
    else:
        save_headers(cfpath, headers)

def load_csv(fpath, dl=['open_date'], ro='list', dtype=None):
    return pd.read_csv(fpath, parse_dates=dl, dtype=dtype, date_parser=ciso8601.parse_datetime).to_dict(ro)

# TODO optimize
def extract_fname2dict(dir, dl=['open_date'], ro='list', filter_func=identity, dtype=None):
    return {fname:load_csv(dir+fname+'.csv', dl=dl, ro=ro, dtype=dtype) for fname in list_fnames(dir, filter_func=filter_func)}

def save_obj_fpath(obj, fpath):
    with open(fpath, 'wb') as f:
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def save_obj(obj, dir, name):
    save_obj_fpath(obj, (dir if dir.endswith('/') else (dir+'/')) + name + '.pkl')

def load_obj(path):
    with open(path if path.endswith('.pkl') else (path+'.pkl'), 'rb') as f:
        return pickle.load(f)

def save_zipped_pickle(obj, fpath):
    cp.dump(obj, fpath, compression='gzip')

def load_zipped_pickle(fpath):
    return cp.load(fpath, compression='gzip')

def load_dpv_ld(fpath, d_key='open_date', p_key='price', v_key='volume'):
    ld = []
    with open(fpath, 'r') as f:
        did,pid,vid = -1,-1,-1
        for id,line in enumerate(f.readlines()):
            ad = line.strip().split(',')
            if id==0:
                did,pid,vid = ad.index(d_key),ad.index(p_key),ad.index(v_key)
                continue
            if not ad[0]:
                continue
            ld.append({d_key:strpdatetime(ad[did]), p_key:float(ad[pid]), v_key:float(ad[vid])})
    return ld

########################################################
### Generic functions
########################################################

def try_or_none(f, *args, **kwargs):
    try:
        return f(*args, **kwargs)
    except Exception as e:
        return None

########################################################
### REST functions
########################################################

def _get(url):
    headers = {"Accept": "application/json"}
    return requests.get(url, headers = headers).json();

def _post(url, payload):
    req = requests.post(url, data = payload)
    return req.json()

########################################################
### Main guard block
########################################################

if __name__ == '__main__':
    print(list_fnames('C:/Users/Aleksandar/Desktop/QH/Binance/2017-11-22 0000 2019-05-26 1100/'))
    pass
