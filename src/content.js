const styleFiles = [
];
const scriptFiles = [
    'src/components/remover/remover.js',
];

window.addEventListener('DOMContentLoaded', async () => {
    loadStyleFiles();
    loadScriptFiles();
});

function loadStyleFiles() {
    styleFiles.forEach(file => {
        const styleCss = document.createElement('link');
        styleCss.rel = 'stylesheet';
        styleCss.href = file.startsWith('http') ? file : chrome.runtime.getURL(file);
        document.head.appendChild(styleCss);
    });
}

function loadScriptFiles() {
    scriptFiles.forEach(file => {
        const scriptJs = document.createElement('script');
        scriptJs.src = file.startsWith('http') ? file : chrome.runtime.getURL(file);
        document.head.appendChild(scriptJs);
    });
}