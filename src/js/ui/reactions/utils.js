import { fetchUser } from '../user-setup';

const modalTpl = function (title) {
    return `<div class="modal" id="loginModal">
<div class="modal__dialog">
  <div class="modal__dialog__header">
    <div class="modal__dialog__title">
      ${typeof title === 'undefined' ? 'Login/Sign Up' : title}
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
    <iframe src="/login" class="login-frame"></iframe>
</div>`;
};

export const createLoginModal = ({ done, title }) => {
    return new Promise((resolve, reject) => {
        const lastFocused = document.activeElement;
        const frag = document
            .createRange()
            .createContextualFragment(modalTpl(title));
        const modal = document.body.appendChild(frag.firstElementChild);
        modal
            .querySelector('.modal__close-btn')
            .addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 275);
                document.querySelector('.app__main').classList.remove('fade');
                lastFocused.focus();
                reject();
            });
        const messageHandler = (evt) => {
            let success = 0;
            if (evt.data.ok) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 275);
                done();
                document.querySelector('.app__main').classList.remove('fade');
                lastFocused.focus();
                fetchUser();
                success = 1;
            }
            window.removeEventListener('message', messageHandler);
            resolve(success);
        };
        window.addEventListener('message', messageHandler);
        document.querySelector('.app__main').classList.add('fade');
        setTimeout(() => modal.classList.add('show'), 100);
        return modal;
    });
};

export const getBlnqName = () => window.location.pathname.split('/')[2];
