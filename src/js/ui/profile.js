import croppie from 'croppie';
import '../../../node_modules/croppie/croppie.css';
import store from '../state/store';
import { getCookie } from '../../js/utils/cookies';

const modalTpl = function (content) {
    return `<div class="modal" id="profileModal">
<div class="modal__dialog">
  <div class="modal__dialog__header">
    <div class="modal__dialog__title">
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentcolor" d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/>
        </svg>
      Profile
    </div>
    <button class="btn btn--icon modal__close-btn" title="close">
        <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        >
        <path
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
        </svg>
    </button>
  </div>
    <div class="modal__dialog__body">
        <section class="section">
            <div class="section__body">

                <div class="profile-image">
                    <div class="circle">
                        <img src="/avatar/${store.state.user.id}"/>
                    </div>
                    <div class="upload">
                        <input type="file" id="upload" value="Choose a file" accept="image/*">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" class="fill" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3.2"/>
                            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                        </svg>
                    </div>
                </div>

                <div class="field field--full" style="display:none;">
                    <label>
                        <div class="field__label">
                            Display Name
                            
                        </div>
                        
                        <input
                            type="text"
                            id="3"
                            autocomplete="off"
                            value="${store.state.user.displayname}"
                        />
                    </label>
                </div>
            </div>
        </section>
    </div>
    <div class="modal__dialog__footer">
        <button class="btn" id="saveProfile">
            <svg
                fill="currentcolor"
                width="24"
                height="24"
                viewBox="0 0 24 24"
            >
                <path
                    d="M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3 5.49-5.5z"
                />
            </svg>
            <span class="inner">Save Profile</span>
        </button>
    </div>
</div>`;
};

export default async function () {
    const frag = document.createRange().createContextualFragment(modalTpl());
    const modal = document.body.appendChild(frag.firstElementChild);
    modal.querySelector('.modal__close-btn').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 275);
        document.querySelector('.app__main').classList.remove('fade');
    });
    document.querySelector('.app__main').classList.add('fade');

    modal.querySelector('#upload').addEventListener('change', function () {
        readFile(this);
    });

    modal.querySelector('#saveProfile').addEventListener('click', () => {
        var avatar;
        if (typeof myCroppie !== 'undefined') {
            myCroppie
                .result({
                    type: 'base64',
                    format: 'png',
                    size: { width: 200, height: 200 },
                    circle: false
                })
                .then(async (result) => {
                    avatar = result;
                    var avatars = document.querySelectorAll(
                        `img[src$="/avatar/${store.state.user.id}"]`
                    );
                    const response = await fetch('/api/v1/profile', {
                        method: 'POST',
                        body: JSON.stringify({
                            avatar: avatar
                        }),
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCookie('_csrf'),
                            'CSRF-Token': getCookie('_csrf')
                        }
                    });

                    setTimeout(function () {
                        avatars.forEach((avatarToChange) => {
                            var src = avatarToChange.src;
                            avatarToChange.src = '';
                            avatarToChange.src = src;
                        });
                    }, 500);
                });
        } else {
            modal.classList.remove('show');
            document.querySelector('.app__main').classList.remove('fade');
        }
        modal.classList.remove('show');
        document.querySelector('.app__main').classList.remove('fade');

        setTimeout(() => modal.remove(), 275);
    });

    setTimeout(() => modal.classList.add('show'), 100);

    var myCroppie;
    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                try {
                    myCroppie.destroy();
                } catch (e) {}

                var opts = {
                    enableExif: true,
                    viewport: {
                        width: 180,
                        height: 180,
                        type: 'square'
                    },
                    boundary: { height: 200 },
                    enableOrientation: true,
                    enableZoom: true
                };
                myCroppie = new croppie(
                    modal.querySelector('.profile-image'),
                    opts
                );

                var rotateButton = document.createElement('button');
                rotateButton.setAttribute('aria-label', 'Rotate Avatar');
                rotateButton.setAttribute('title', 'Rotate Avatar');
                rotateButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="fill" width="24" height="24" viewBox="0 0 24 24">
                <path d="M7.47 21.49C4.2 19.93 1.86 16.76 1.5 13H0c.51 6.16 5.66 11 11.95 11 .23 0 .44-.02.66-.03L8.8 20.15l-1.33 1.34zM12.05 0c-.23 0-.44.02-.66.04l3.81 3.81 1.33-1.33C19.8 4.07 22.14 7.24 22.5 11H24c-.51-6.16-5.66-11-11.95-11zM16 14h2V8c0-1.11-.9-2-2-2h-6v2h6v6zm-8 2V4H6v2H4v2h2v8c0 1.1.89 2 2 2h8v2h2v-2h2v-2H8z"/>
            </svg>
            
            `;
                rotateButton.classList.add('btn');
                rotateButton.addEventListener('click', () => {
                    myCroppie.rotate(90);
                });
                modal
                    .querySelector('.cr-slider-wrap')
                    .appendChild(rotateButton);
                myCroppie
                    .bind({
                        url: e.target.result
                    })
                    .then(() => {
                        modal.querySelector(
                            '.profile-image .circle'
                        ).style.display = 'none';
                        modal.querySelector(
                            '.profile-image'
                        ).style.marginBottom = '0px';
                    });
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    return modal;
}
