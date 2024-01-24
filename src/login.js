import { getCookie } from './js/utils/cookies';

const urlParams = new URLSearchParams(window.location.search);
const redirectUrl = urlParams.has('redirect') && urlParams.get('redirect');

class FormSerializer {
    constructor(form) {
        this.init(form);
    }
    init(form) {
        this.form = form;
        this.url = this.form.action;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateRequired()) {
                this.submit();
            } else {
                console.log('not all filled');
            }
        });
        this.feedbackTarget =
            this.form.dataset.feedbackTarget &&
            document.querySelector(this.form.dataset.feedbackTarget);
        this.feedbackTarget &&
            this.feedbackTarget.addEventListener('animationend', (e) =>
                e.target.classList.remove('shake')
            );
        this.fields = [].slice.call(
            this.form.querySelectorAll('input,select,textarea')
        );
        this.errorContainer = this.form.querySelector('.form-error-container');
        this.required = [].slice.call(this.form.querySelectorAll('[required]'));
    }

    validateRequired() {
        return this.required.some((field) => field.value.trim().length);
    }

    serialize() {
        const formData = new FormData(this.form);
        const body = {};
        formData.forEach((value, key) => {
            body[key] = value;
        });
        return JSON.stringify(body);
    }

    submit() {
        fetch(this.url, {
            method: this.form.method,
            body: this.serialize(),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('_csrf'),
                'CSRF-Token': getCookie('_csrf')
            }
        })
            .then((r) => r.json())
            .then((r) => {
                if (r.ok) {
                    //console.log('login/signup complete');
                    //put int redirect logic after successful fetch
                    if (window !== top) {
                        top.postMessage(
                            { ok: -1, route: this.url },
                            window.location.origin
                        );
                    } else {
                        window.location.href = redirectUrl || '/dashboard';
                    }
                } else {
                    this.giveFeedback(r.errors);
                }
            });
    }

    giveFeedback(errors) {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = Object.keys(errors)
                .map((key) => `<div>${errors[key]}</div>`)
                .join('');
        }
        this.feedbackTarget && this.feedbackTarget.classList.add('shake');
    }
}

[].slice
    .call(document.querySelectorAll('form'))
    .forEach((fm) => new FormSerializer(fm));

const themePref = localStorage.getItem('pref-theme');
if (themePref !== null) {
    if (themePref === 'light') {
        document
            .querySelector('body')
            .setAttribute('data-theme', 'theme-light');
        document
            .querySelector('html')
            .setAttribute('data-theme', 'theme-light');
    } else if (themePref === 'auto') {
        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-dark');
            }
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-light');
            }
        } else {
            document
                .querySelector('body')
                .setAttribute('data-theme', 'theme-dark');
        }

        const darkModeMediaQuery = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );
        darkModeMediaQuery.addListener((e) => {
            const darkModeOn = e.matches;

            if (darkModeOn) {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-dark');
            } else {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-light');
            }
        });
    } else {
        document.querySelector('body').setAttribute('data-theme', 'theme-dark');
    }
} else {
    document.querySelector('body').setAttribute('data-theme', 'theme-dark');
}
