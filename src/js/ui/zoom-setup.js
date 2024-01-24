import store from '../state/store';

export default function zoomSetup() {
    var savedZoom = localStorage.getItem('zoom');
    var preview = document.querySelector('.preview');
    var sizeSelector = document.querySelector('#sizeSelector');
    var sizerFieldValue = document.querySelector('#sizerSelect .field__value');
    var flipButton = document.querySelector('#flipButton');
    var zoomText = document.querySelector('.zoom');

    var options = [
        {
            label: 'Viewports',
            options: [
                {
                    id: 'all',
                    name: 'All Available Space',
                    width: '100%',
                    height: '100%'
                }
            ]
        },
        {
            label: 'Desktop',
            options: [
                {
                    id: 'desktop',
                    name: 'Desktop (1024x768)',
                    width: '1024px',
                    height: '768px'
                },
                {
                    id: 'desktop_hd',
                    name: 'Desktop HD (1280x720)',
                    width: '1280px',
                    height: '720px'
                },
                {
                    id: 'desktop_shd',
                    name: 'Desktop SHD (1280x1080)',
                    width: '1280px',
                    height: '1080px'
                },
                {
                    id: 'desktop_fhd',
                    name: 'Desktop FHD (1920x1080)',
                    width: '1920px',
                    height: '1080px'
                },
                {
                    id: 'desktop_qhd',
                    name: 'Desktop QHD (2560x1440)',
                    width: '2560px',
                    height: '1440px'
                },
                {
                    id: 'desktop_uhd',
                    name: 'Desktop UHD (3840x2160)',
                    width: '3840px',
                    height: '2160px'
                }
            ]
        },
        {
            label: 'iPhone',
            options: [
                {
                    id: 'iPhone12',
                    name: 'iPhone 12/12 Pro (390x844)',
                    width: '390px',
                    height: '844px'
                },
                {
                    id: 'iPhone12Mini',
                    name: 'iPhone 12 Mini (375x812)',
                    width: '375px',
                    height: '812px'
                },
                {
                    id: 'iPhone8',
                    name: 'iPhone 8 (375x667)',
                    width: '375px',
                    height: '667px'
                },
                {
                    id: 'iPhone8Plus',
                    name: 'iPhone 8 Plus (414x736)',
                    width: '414px',
                    height: '736px'
                },
                {
                    id: 'iPhone5SE',
                    name: 'iPhone 5 SE (320x568)',
                    width: '320px',
                    height: '568px'
                }
            ]
        },
        {
            label: 'iPad',
            options: [
                {
                    id: 'iPadMini',
                    name: '7.9" iPad (768x1024)',
                    width: '768px',
                    height: '1024px'
                },
                {
                    id: 'iPad',
                    name: '9.7" iPad (768x1024)',
                    width: '768px',
                    height: '1024px'
                },
                {
                    id: 'iPadAir',
                    name: '10.5" iPad Air (834x1112)',
                    width: '834px',
                    height: '1112px'
                },
                {
                    id: 'iPadPro',
                    name: '11" iPad Pro (834x1194)',
                    width: '834px',
                    height: '1194px'
                },
                {
                    id: 'iPadProBig',
                    name: '12.9" iPad Pro (1024x1366)',
                    width: '1024px',
                    height: '1366px'
                }
            ]
        },
        {
            label: 'Android',
            options: [
                {
                    id: 'pixel3',
                    name: 'Pixel 3 (360x720)',
                    width: '360px',
                    height: '720px'
                },
                {
                    id: 'pixel3XL',
                    name: 'Pixel 3 XL (360x740)',
                    width: '360px',
                    height: '740px'
                },
                {
                    id: 'GalaxyS10',
                    name: 'Galaxy S10 (360x760)',
                    width: '360px',
                    height: '760px'
                }
            ]
        }
    ];

    options.forEach((obj) => {
        var optionGroup = document.createElement('optgroup');
        optionGroup.label = obj.label;

        obj.options.forEach((obj) => {
            var option = document.createElement('option');
            option.setAttribute('data-width', obj.width);
            option.setAttribute('data-height', obj.height);
            option.innerHTML = obj.name;
            option.value = obj.id;
            if (savedZoom !== null) {
                if (obj.id === savedZoom) {
                    option.setAttribute('selected', true);
                }
            }

            
            optionGroup.append(option);
        });

        /**/

        sizeSelector.append(optionGroup);
    });

    function workoutzoom() {
        var selected = sizeSelector.options[sizeSelector.selectedIndex];

        var optGroup = selected.parentNode;
        sizerFieldValue.innerHTML = selected.innerHTML;

        var width = selected.getAttribute('data-width');
        var height = selected.getAttribute('data-height');
        var zoom = 1;

        if (flipButton.classList.contains('active')) {
            width = selected.getAttribute('data-height');
            height = selected.getAttribute('data-width');
        }

        if (
            optGroup.label !== 'iPhone' &&
            optGroup.label !== 'iPad' &&
            optGroup.label !== 'Android'
        ) {
            width = selected.getAttribute('data-width');
            height = selected.getAttribute('data-height');
        }

        if (width.indexOf('%') === -1) {
            var previewWidth = preview.offsetWidth;
            var previewHeight = preview.offsetHeight;


            var intWidth = parseInt(width.replace('px', ''));
            var intHeight = parseInt(height.replace('px', ''));

            var offset = 70;
            if (
                previewWidth - offset < intWidth ||
                previewHeight - offset < intHeight
            ) {
                zoom = Math.min(
                    (previewWidth - offset) / intWidth,
                    (previewHeight - offset) / intHeight
                );
            }
        }

        if (width.indexOf('%') === -1) {
            zoomText.innerHTML = (zoom * 100).toFixed(0) + '%';
        } else {
            zoomText.innerHTML = '';
        }
        if (
            optGroup.label === 'iPhone' ||
            optGroup.label === 'iPad' ||
            optGroup.label === 'Android'
        ) {
            flipButton.innerHTML = `<svg width="16" height="16">
            <g fill="none" fill-rule="evenodd">
                <path d="M0 0h16v16H0z"></path>
                <path d="M10.987 1.68a7 7 0 0 1 3.98 5.653h1C15.627 3.227 12.193 0 8 0l-.44.02 2.54 2.54.887-.88zM6.82 1.167a.994.994 0 0 0-1.413 0l-4.24 4.24a.994.994 0 0 0 0 1.413l8.013 8.013a.994.994 0 0 0 1.413 0l4.24-4.24a.994.994 0 0 0 0-1.413L6.82 1.167zm3.067 12.96L1.873 6.113l4.24-4.24 8.014 8.014-4.24 4.24zm-4.874.193a6.991 6.991 0 0 1-3.98-5.653h-1C.373 12.773 3.807 16 8 16l.44-.02-2.54-2.54-.887.88z" fill="currentcolor"></path>
            </g>
        </svg>`;
        } else {
            flipButton.innerHTML = '';
        }

        preview.style =
            '--width:' + width + ';--height:' + height + ';--zoom:' + zoom;

        //iFrame.style =
        //'--width:' + width + ';--height:' + height + ';--zoom:' + zoom;
        preview.setAttribute('data-zoom', selected.value);
    }

    sizeSelector.addEventListener('change', function (e) {
        localStorage.setItem('zoom', e.currentTarget.value);
        workoutzoom();
    });

    flipButton.addEventListener('click', function (e) {
        flipButton.classList.toggle('active');
        //flipButton.classList.toggle('btn--spin');
        /*ga.event(
            'Zoom Flip',
            flipButton.classList.contains('active') ? 'Portrait' : 'Landscape'
        );*/

        workoutzoom();
    });

    window.addEventListener('resize', function () {
        workoutzoom();
    });

    workoutzoom();
}
