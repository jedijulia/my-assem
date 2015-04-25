var translator = {
    data: null,
    container: $('#translation ul'),
    translate: function() {
        translator.data = $('textarea').val().trim();
        translator.data = translator.data.replace(/(\r?\n)+/g, '\n');
        translator.data = translator.data.replace(/ +/g, ' ');
        translator.data = translator.data.split(/\r?\n/g);

        translator.data = translate(translator.data);
        var container = translator.container.empty();
        for (var i = 0, l = translator.data.translation.length; i < l; i++) {
            var item = '<li>' + translator.data.translation[i] + '</li>';
            translator.container.append(item);
        }
    }
};


var executer = {
    execute: function() {
        if (!translator.data) {
            translator.translate();
        }
        execute(translator.data);
    }
};


$('nav').on('click', 'a[data-action]', function() {
    var action = $(this).data('action');
    if (action === 'translate') {
        translator.translate();
    } else if (action === 'execute') {
        executer.execute();
    }
});
