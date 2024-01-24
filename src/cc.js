const tpl = `
<div class="cc-banner" role="dialog" aria-live="polite" aria-label="cookieconsent" aria-describedby="cookieconsent:desc">
    This site uses cookies in order to provide you with the functionality to ensure you can use our platform and receive the best possible experience of blnq studio. 
    We take your continued use of the website as your consent to this policy. <a href="/terms#cookies">Learn more</a>
    <button class="btn">Agree</button>
</div>`;

(function () {
    let cookies;

    function readCookie(name, c, C, i) {
        if (cookies) {
            return cookies[name];
        }

        c = document.cookie.split('; ');
        cookies = {};

        for (i = c.length - 1; i >= 0; i--) {
            C = c[i].split('=');
            cookies[C[0]] = C[1];
        }

        return cookies[name];
    }

    window.readCookie = readCookie;

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
    window.setCookie = setCookie;

    if (!readCookie('cc-blnq-accept')) {
        const banner = document.createRange().createContextualFragment(tpl);
        banner.querySelector('button.btn').addEventListener('click', () => {
            setCookie('cc-blnq-accept', true, 365);
            document.body.querySelector('.cc-banner').classList.add('hide');
            setTimeout(function () {
                document.body.removeChild(
                    document.body.querySelector('.cc-banner')
                );
            }, 500);
        });
        document.body.appendChild(banner);
    }
})();
