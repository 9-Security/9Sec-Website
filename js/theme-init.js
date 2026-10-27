(function () {
    try {
        var t = localStorage.getItem('9sec_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', t);
    } catch (e) { /* private mode / storage blocked */ }
})();
