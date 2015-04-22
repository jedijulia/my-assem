var menu = {
    file: function() {
        console.info('FILE');
    },
    translate: function() {
        var code = $('textarea').val().trim();
        code = code.replace(/(\r?\n)+/g, '\n').replace(/ +/g, ' ');
        code = code.split(/\r?\n/g);

        var translated = translate(code);
        console.log(translated.translation);
        var container = $('#translation ul').empty();
        for (var i = 0, l = translated.translation.length; i < l; i++) {
            container.append('<li>' + translated.translation[i] + '</li>');
        }
    },
    trace: function() {
        console.info('TRACE');
    },
    execute: function() {
        console.info('EXECUTE');
    }
};


$('nav').on('click', 'a[data-action]', function() {
    menu[$(this).data('action')]();
});
