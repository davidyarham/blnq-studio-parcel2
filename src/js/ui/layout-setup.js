import Split from 'split.js';
import { create } from 'domain';
import { editorSetup } from './editor-setup';
import { editor } from 'monaco-editor';

var mainSplitInstance;
var editorSplitInstance;
function createEditorSplitter() {
    try {
        editorSplitInstance.destroy();
    } catch (e) {}
    var appLayout = document.querySelector('.app-layout');
    var dataLayout = appLayout.getAttribute('data-layout');
    if (
        dataLayout === 'split-top' ||
        dataLayout === 'split-bottom' ||
        dataLayout === 'split-right' ||
        dataLayout === 'split-left'
    ) {
        var editors = ['#editorHTML', '#editorCSS', '#editorJS'];
        if (document.querySelector('#pref-datatab').checked) {
            editors.push('#editorJSON');
        }
        

        var minSize = 0;
        var direction = 'horizontal';

        if (dataLayout === 'split-right' || dataLayout === 'split-left') {
            direction = 'vertical';
            minSize = 42;
        }
        var layoutSizes = null;
        if (localStorage.getItem('editor-layout-sizes') !== null) {
            layoutSizes = JSON.parse(
                localStorage.getItem('editor-layout-sizes')
            );
        }

        editorSplitInstance = Split(editors, {
            direction: direction,
            gutterSize: 8,
            minSize: minSize,
            snapOffset: 0,
            sizes: layoutSizes,
            elementStyle: function (dimension, size, gutterSize) {
                return {
                    'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
                };
            },
            gutter: (index, direction) => {
                const gutter = document.createElement('div');
                gutter.className = `editor--gutter`;
                return gutter;
            },
            gutterStyle: function (dimension, gutterSize) {
                return {
                    'flex-basis': gutterSize + 'px'
                };
            },
            onDrag: function () {
                window.dispatchEvent(new Event('resize'));
            },
            onDragEnd: function (sizes) {
                localStorage.setItem(
                    'editor-layout-sizes',
                    JSON.stringify(sizes)
                );
            }
        });
    }
    window.dispatchEvent(new Event('resize'));
}

var layouts = [
    'right-left',
    'left-right',
    'top-bottom',
    'bottom-top',
    'split-right',
    'split-left',
    'split-top',
    'split-bottom'
];
var layoutIndex = 0;

function setLayout(layout) {
    localStorage.setItem('layout', layouts.indexOf(layout));
    localStorage.removeItem('layout-sizes');
    localStorage.removeItem('editor-layout-sizes');
    document.querySelector('.app-layout').setAttribute('data-layout', layout);

    createSplitter();
}

const previewSection = document.querySelector('.app__section--preview');
const editorsSection = document.querySelector('.app__section--editors');
const togglePreview = document.querySelector('#togglePreview');
togglePreview.addEventListener('click', () => {
    previewSection.classList.toggle('hide-preview');
    editorsSection.classList.toggle('hide-preview');
    setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
    }, 275);
});

function createSplitter() {
    var appLayout = document.querySelector('.app-layout');
    var dataLayout = appLayout.getAttribute('data-layout');
    try {
        mainSplitInstance.destroy();
    } catch (e) {}

    var layoutSizes = [50, 50];

    if (localStorage.getItem('layout-sizes') !== null) {
        layoutSizes = JSON.parse(localStorage.getItem('layout-sizes'));
    }

    var orientation = 'horizontal';
    var minSize = [300, 300];
    if (
        dataLayout === 'top-bottom' ||
        dataLayout === 'bottom-top' ||
        dataLayout === 'split-top' ||
        dataLayout === 'split-bottom'
    ) {
        orientation = 'vertical';
        minSize = [150, 150];
    }
    var order = ['.app__section--preview', '.app__section--editors'];
    if (
        dataLayout === 'left-right' ||
        dataLayout === 'split-left' ||
        dataLayout === 'top-bottom' ||
        dataLayout === 'split-top'
    ) {
        order = ['.app__section--editors', '.app__section--preview'];
    }

    mainSplitInstance = Split(order, {
        direction: orientation,
        gutterSize: 8,
        minSize: minSize,
        snapOffset: 0,
        sizes: layoutSizes,

        elementStyle: function (dimension, size, gutterSize) {
            return {
                'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
            };
        },
        gutter: (index, direction) => {
            const gutter = document.createElement('div');
            gutter.className = `app__section--gutter`;
            return gutter;
        },
        gutterStyle: function (dimension, gutterSize) {
            return {
                'flex-basis': gutterSize + 'px'
            };
        },
        onDrag: function () {
            var gutter = document.querySelector('.app__section--gutter');
            if (document.querySelector('#sizeSelector').value === 'all') {
                gutter.classList.add('dragging');
            }
            var positionInfo = document
                .querySelector('.app__section--preview .preview')
                .getBoundingClientRect();

            if (orientation === 'horizontal') {
                gutter.setAttribute('data-size', parseInt(positionInfo.width));
            } else {
                gutter.setAttribute('data-size', parseInt(positionInfo.height));
            }
            window.dispatchEvent(new Event('resize'));
        },
        onDragEnd: function (sizes) {
            var gutter = document.querySelector('.app__section--gutter');
            gutter.classList.remove('dragging');
            localStorage.setItem('layout-sizes', JSON.stringify(sizes));
        }
    });

    createEditorSplitter();

    document
        .querySelector('.app__section--gutter')
        .addEventListener('dblclick', () => {
            localStorage.removeItem('layout-sizes');
            createSplitter();
        });
    window.dispatchEvent(new Event('resize'));

    //console.groupEnd();
    document.querySelectorAll('.layout-choices button').forEach((opt) => {
        opt.classList.remove('active');
    });
    document
        .querySelector(`.layout-choices [data-layout="${dataLayout}"]`)
        .classList.add('active');
}

function layoutSetup() {
    var savedLayout = localStorage.getItem('layout');

    var appLayout = document.querySelector('.app-layout');

    if (savedLayout !== null) {
        layoutIndex = localStorage.getItem('layout');
        appLayout.setAttribute('data-layout', layouts[layoutIndex]);
        window.dispatchEvent(new Event('resize'));
    }

    document
        .querySelector('#layoutButton')
        .addEventListener('click', function () {
            layoutIndex++;
            if (layoutIndex === layouts.length) {
                layoutIndex = 0;
            }
            appLayout.setAttribute('data-layout', layouts[layoutIndex]);
            localStorage.setItem('layout', layoutIndex);
            localStorage.removeItem('layout-sizes');
            localStorage.removeItem('editor-layout-sizes');
            createSplitter();
        });
    createSplitter();
}

export { layoutSetup, createEditorSplitter, setLayout };
