const iframeSetup = () => {
    const initialIFrame = document.createElement('iframe');
    initialIFrame.id = 'output';
    initialIFrame.title = 'preview';
    initialIFrame.src = '';
    initialIFrame.setAttribute('allowfullscreen', 'true');
    /*initialIFrame.setAttribute(
        'sandbox',
        'allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts'
    );
    initialIFrame.setAttribute(
        'allow',
        'geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor'
    );*/
    initialIFrame.setAttribute('allowtransparency', 'false');

    document.querySelector('.app__section__body.preview').append(initialIFrame);

    return initialIFrame;
};

export default iframeSetup;
