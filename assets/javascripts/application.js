var translator = {
    data: null,
    container: $('#translation ul'),
    variables: $('#variables ul'),
    translate: function() {
        translator.data = $('textarea').val().trim();
        translator.data = translator.data.replace(/(\r?\n)+/g, '\n');
        translator.data = translator.data.replace(/ +/g, ' ');
        translator.data = translator.data.split(/\r?\n/g);

        try {
            translator.data = translate(translator.data);
        } catch (error) {
            popup.error(error.message);
            return null;
        }
        var container = translator.container.empty();
        for (var i = 0, l = translator.data.translation.length; i < l; i++) {
            var item = '<li>' + translator.data.translation[i] + '</li>';
            translator.container.append(item);
        }

        var variables = [];
        for (var identifier in translator.data.var_table) {
            var item = $('<li data-index="'
                + translator.data.var_table[identifier] + '">'
                + identifier + '</li>');
            variables.push(item);
        }
        translator.variables.empty();
        for (var i = 0, l = variables.length; i < l; i++) {
            translator.variables.append(variables);
        }
    }
};


var executer = {
    execute: function() {
        translator.translate();
        execute(translator.data);
    }
};


var ui = {
    _translation: translator.container,
    _stack: $('#stack ul'),
    highlight: function(index) {
        ui._translation.children().removeClass('highlight');
        ui._translation.children().eq(index).addClass('highlight');
    },
    stack: function(stack) {
        ui._stack.empty();
        for (var i = 0, l = stack.length; i < l; i++) {
            ui._stack.append('<li>' + stack[i] + '</li>');
        }
    },
    reset: function(full) {
        ui._stack.empty();
        if (full) {
            ui._translation.empty();
            translator.variables.empty();
        }
    }
};


var popup = {
    container: $('#popup-container'),
    dom: $('#popup'),
    opened: false,
    input: function(message) {
        if (!popup.opened) {
            var content = $('<form action="#"></form>');
            content.append('<p>' + message + '</p>');
            content.append('<input type="text" autofocus>');

            popup.dom.find('h3').text('Input');
            popup.dom.find('div').html(content);
            popup.dom.find('span').addClass('hidden');
            popup.open();
        }
    },
    error: function(message) {
        if (!popup.opened) {
            var content = '<p>' + message + '</p>';
            popup.dom.addClass('error');
            popup.dom.find('h3').text('Error');
            popup.dom.find('div').html(content);
            popup.open();
        }
    },
    info: function(message) {
        if (!popup.opened) {
            var content = '<p>' + message + '</p>';
            popup.dom.addClass('info');
            popup.dom.find('h3').text('Info');
            popup.dom.find('div').html(content);
            popup.open();
        }
    },
    open: function() {
        popup.container.removeClass('hidden');
        setTimeout(function() {
            popup.dom.removeClass('unshown');
            popup.dom.find('input').trigger('focus');
        }, 0);
        popup.opened = true;
    },
    close: function() {
        popup.dom.addClass('unshown');
        setTimeout(function() {
            popup.container.addClass('hidden');
            popup.dom.removeClass('info error');
            popup.dom.find('div').empty();
            popup.dom.find('span').removeClass('hidden');
            popup.opened = false;
        }, 200);
    }
};


popup.dom.on('submit', function(e) {
    e.preventDefault();
    input = $(this).find('input').val().trim();
    popup.close();
});


$(document).on('changedpc', function(e) {
    ui.highlight(e.pc);
});

$(document).on('stack', function(e) {
    ui.stack(e.stack);
});

$(document).on('askinput', function(e) {
    popup.input(e.message);
});

$(document).on('error', function(e) {
    popup.error(e.error);
});

$(document).on('done', function() {
    ui._translation.children().removeClass('highlight');
    popup.info('Program execution finished.');
});


$('nav').on('click', 'a[data-action]', function(e) {
    e.preventDefault();
    ui.reset();
    var action = $(this).data('action');
    if (action === 'file') {
        $('input[type="file"]').trigger('click');
    } else if (action === 'translate') {
        $('aside section').removeClass('unshown');
        translator.translate();
    } else if (action === 'execute') {
        $('aside section').removeClass('unshown');
        executer.execute();
    }
});


$('#popup span').on('click', function() {
    popup.close();
});


$('input[type="file"]').on('change', function() {
    var file = $(this)[0].files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        $('textarea').val(e.target.result);
        translator.data = null;
        ui.reset(true);
        $('input[type="file"]').val('');
        $('aside section').addClass('unshown');
    };
    reader.readAsText(file);
});
