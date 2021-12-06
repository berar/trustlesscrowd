import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
# To suppress a warning
from pandas.plotting import register_matplotlib_converters
register_matplotlib_converters()

_fig_size_x, _fig_size_y = 21.5, 20.5

def finalize_plot(fpath, fig, title, yl):
    plt.ylabel(yl)
    plt.title(title)
    plt.legend(loc='upper left')
    plt.tight_layout()
    plt.savefig(fpath, dpi=120)
    plt.close(fig)
    plt.clf()

def init_fig():
    fig = plt.figure()
    fig.set_size_inches(_fig_size_x, _fig_size_y)
    return fig

def plot_timeseries(xt, yt, fpath, title, yl, ylimtop=-1.0):
    fig = init_fig()
    plt.plot(xt, yt)
    if ylimtop > 0.0: plt.ylim(0, ylimtop)
    finalize_plot(fpath, fig, title, yl)

def plot_timeseries_multi(xt, label2yt, fpath, title, yl, ylimtop=-1.0):
    fig = init_fig()
    for k,yt in label2yt.items():
        plt.plot(xt, yt, label=k)
    if ylimtop > 0.0: plt.ylim(0, ylimtop)
    finalize_plot(fpath, fig, title, yl)

def plot_timeseries_stacked(x,ys,fpath,title,yl,labels):
    fig = init_fig()
    plt.stackplot(x,ys, labels=labels)
    finalize_plot(fpath, fig, title, yl)

if __name__ == '__main__':
    pass
