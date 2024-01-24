import { getEditor } from './editor-setup';
import store, { dispatch } from '../state/store';

var iFrameDocWrapper;
/*Ruler*/

const rulerButton = document.querySelector('#showRuler');
const inspectorButton = document.querySelector('#showInspector');
const outlineButton = document.querySelector('#showOutlines');
rulerButton.addEventListener('change', () => {
    if (rulerButton.checked) {
        document.querySelector('.preview').classList.add('show-ruler');
    } else {
        document.querySelector('.preview').classList.remove('show-ruler');
    }

    localStorage.setItem('pref-showruler', rulerButton.checked);
    !inspectorButton.checked && !rulerButton.checked
        ? iFrameDocWrapper.classList.remove('prevent-select')
        : iFrameDocWrapper.classList.add('prevent-select');
});

const rulerPref = localStorage.getItem('pref-showruler');
if (rulerPref !== null) {
    if (JSON.parse(rulerPref)) {
        rulerButton.setAttribute('checked', true);
        document.querySelector('.preview').classList.add('show-ruler');
    }
}

/*Inspector*/
inspectorButton.addEventListener('change', () => {
    localStorage.setItem('pref-showinspect', inspectorButton.checked);
    !inspectorButton.checked && !rulerButton.checked
        ? iFrameDocWrapper.classList.remove('prevent-select')
        : iFrameDocWrapper.classList.add('prevent-select');
});

const inspectPref = localStorage.getItem('pref-showinspect');
if (inspectPref !== null) {
    if (JSON.parse(inspectPref)) {
        inspectorButton.setAttribute('checked', true);
    }
}

/*Outlines*/
outlineButton.addEventListener('change', () => {
    localStorage.setItem('pref-showoutlines', outlineButton.checked);
    dispatch('updateDocument', { isDirty: store.state.isDirty });
});

const outlinePref = localStorage.getItem('pref-showoutlines');
if (outlinePref !== null) {
    if (JSON.parse(outlinePref)) {
        outlineButton.setAttribute('checked', true);
        dispatch('updateDocument', { isDirty: store.state.isDirty });
    }
}

export default function inspectorSetup(iFrame) {
    const HTMLEditor = getEditor('html');

    const rulerButton = document.querySelector('#showRuler');
    const inspectorButton = document.querySelector('#showInspector');

    const outlineButton = document.querySelector('#showOutlines');

    const inspector = document.querySelector('.inspector');

    const inspectorOverlay = document.querySelector('.inspector__overlay');

    const inspectorMargin = document.querySelector('.inspector__margin');
    const inspectorPadding = document.querySelector('.inspector__padding');
    const inspectorContent = document.querySelector('.inspector__content');
    const inspectorBubble = document.querySelector('.inspector__bubble');

    const ruler = document.querySelector('.ruler');
    const rulerAxisX = document.querySelector('.ruler__axis-x');
    const rulerAxisY = document.querySelector('.ruler__axis-y');

    const iFrameDoc = iFrame.contentWindow.document;

    iFrameDocWrapper = document.querySelector('.app__section__body.preview');

    inspectorButton.checked || rulerButton.checked
        ? iFrameDocWrapper.classList.add('prevent-select')
        : iFrameDocWrapper.classList.remove('prevent-select');

    var prevEl;

    var viewportWidth, viewportHeight;
    const doMagic = (e) => {
        if (rulerButton.checked) {
            var pageX = e.clientX;
            var pageY = e.clientY;

            if (e.changedTouches) {
                pageX = parseInt(e.changedTouches[0].pageX);
                pageY = parseInt(e.changedTouches[0].pageY);
            }

            //console.log(e.changedTouches[0].pageX, e.changedTouches[0].pageY);

            rulerAxisX.style.left = pageX + 'px';
            rulerAxisY.style.top = pageY + 'px';

            rulerAxisX.innerHTML = pageX;
            rulerAxisY.innerHTML = `<div>${pageY}</div>`;
        }
        if (inspectorButton.checked) {
            viewportWidth = e.currentTarget.documentElement.getBoundingClientRect()
                .width;
            viewportHeight = e.currentTarget.documentElement.getBoundingClientRect()
                .height;
            var newEl = e.target;
            var st = window.getComputedStyle(newEl);
            if (e.changedTouches) {
                newEl = iFrameDoc.elementFromPoint(
                    e.changedTouches[0].pageX,
                    e.changedTouches[0].pageY
                );
            }

            var pageX = e.clientX;
            var pageY = e.clientY;

            if (e.changedTouches) {
                pageX = parseInt(e.changedTouches[0].pageX);
                pageY = parseInt(e.changedTouches[0].pageY);
            }

            inspectorBubble.style.top = pageY + 'px';
            inspectorBubble.style.left = pageX + 'px';

            if (newEl !== prevEl) {
                prevEl = newEl;
                const rect = newEl.getBoundingClientRect();

                inspectorOverlay.style.top = rect.top + 'px';
                inspectorOverlay.style.left = rect.left + 'px';
                inspectorOverlay.style.width = rect.width + 'px';
                inspectorOverlay.style.height = rect.height + 'px';

                /*USE st.width * st.height & then apply transform gets you half way to proper rotated inspectors*/

                inspectorOverlay.style.setProperty('--mt', st.marginTop);
                inspectorOverlay.style.setProperty('--mr', st.marginRight);
                inspectorOverlay.style.setProperty('--mb', st.marginBottom);
                inspectorOverlay.style.setProperty('--ml', st.marginLeft);

                inspectorOverlay.style.setProperty('--pt', st.paddingTop);
                inspectorOverlay.style.setProperty('--pr', st.paddingRight);
                inspectorOverlay.style.setProperty('--pb', st.paddingBottom);
                inspectorOverlay.style.setProperty('--pl', st.paddingLeft);

                var classString = '';

                try {
                    //Weirdly it sometimes says that it cannot split the className??
                    classString = newEl.className.split(' ');
                    classString = classString.join('.');
                    if (classString !== '') {
                        classString = '.' + classString;
                    }
                } catch (e) {}
                if (newEl.id !== '') {
                    classString = '#' + newEl.id + classString;
                }

                inspectorBubble.innerHTML = '';

                inspectorBubble.innerHTML = `<div class="row">
                        <div class="type">
                            <span class="id">${
                                newEl.nodeName
                            }</span><span class="class">${classString}</span>
                        </div>
                        <div class="size">${parseInt(rect.width)} x ${parseInt(
                    rect.height
                )}</div>
                    </div>
                    
                    ${
                        st.margin !== '0px'
                            ? `<div class="row">
                            <div class="prop">Margin</div>
                            <div class="size">${st.margin}</div>
                            </div>`
                            : ''
                    }
                    ${
                        st.padding !== '0px'
                            ? `<div class="row">
                            <div class="prop">Padding</div>
                            <div class="size">${st.padding}</div>
                            </div>`
                            : ''
                    }
                    ${
                        st.perspective !== 'none'
                            ? `<div class="row">
                            <div class="prop">perspective</div>
                            <div class="size">${st.perspective}</div>
                            </div>`
                            : ''
                    }
                    `;

                /*${
                        st.color !== ''
                            ? `<div class="row">
                            <div class="prop">Color</div>
                            <div class="size">${st.color}</div>
                            </div>`
                            : ''
                    }
                    ${
                        st.font !== 'none'
                            ? `<div class="row">
                            <div class="prop">Font</div>
                            <div class="size">${st.font}</div>
                            </div>`
                            : ''
                    }
                    ${
                        st.backgroundColor !== 'none'
                            ? `<div class="row">
                            <div class="prop">Background</div>
                            <div class="size">${st.backgroundColor}</div>
                            </div>`
                            : ''
                    }*/

                try {
                    var toFind = newEl.outerHTML;
                    /*console.log(
                        'Maybe we can target the place in the code using e.path',
                        e.path
                    );*/

                    const range = HTMLEditor.getModel().findMatches(toFind);
                    if (range.length > 0) {
                        HTMLEditor.revealRangeInCenterIfOutsideViewport(
                            range[0].range
                        );
                        HTMLEditor.setPosition({
                            lineNumber: range[0].range.startLineNumber,
                            column: range[0].range.startColumn
                        });
                    }
                } catch (e) {}
            }
            try {
                if (
                    pageX + inspectorBubble.getBoundingClientRect().width >
                    viewportWidth - 15
                ) {
                    inspectorBubble.classList.add('left');
                } else {
                    inspectorBubble.classList.remove('left');
                }
                if (
                    pageY + inspectorBubble.getBoundingClientRect().height >
                    viewportHeight - 15
                ) {
                    inspectorBubble.classList.add('top');
                } else {
                    inspectorBubble.classList.remove('top');
                }
            } catch (e) {}
        }
    };

    iFrameDoc.addEventListener('mousemove', doMagic);
    iFrameDoc.addEventListener('touchmove', doMagic);

    iFrameDoc.addEventListener('mouseenter', (e) => {
        viewportWidth = e.currentTarget.documentElement.getBoundingClientRect()
            .width;
        viewportHeight = e.currentTarget.documentElement.getBoundingClientRect()
            .height;
        if (inspectorButton.checked) {
            inspector.style.display = 'flex';
        }
    });
    iFrameDoc.addEventListener('touchstart', (e) => {
        if (inspectorButton.checked) {
            inspector.style.display = 'flex';
        }
    });
    iFrameDocWrapper.addEventListener('mouseenter', (e) => {
        if (inspectorButton.checked) {
            inspector.style.display = 'flex';
        }
    });
    iFrameDoc.addEventListener('mouseleave', (e) => {
        inspector.style.display = 'none';
        rulerAxisX.innerHTML = '';
        rulerAxisY.innerHTML = '';
    });
    iFrameDoc.addEventListener('touchend', (e) => {
        inspector.style.display = 'none';
        rulerAxisX.innerHTML = '';
        rulerAxisY.innerHTML = '';
    });
    iFrameDocWrapper.addEventListener('mouseleave', (e) => {
        inspector.style.display = 'none';
        rulerAxisX.innerHTML = '';
        rulerAxisY.innerHTML = '';
    });

    iFrameDoc.addEventListener('click', (e) => {
        if (inspectorButton.checked) {
            inspectorButton.checked = false;
            inspector.style.display = 'none';
            localStorage.setItem('pref-showinspect', inspectorButton.checked);
            HTMLEditor.focus();
            e.preventDefault();
        }
    });
}
