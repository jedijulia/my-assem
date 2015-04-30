var fs = require('fs');
var path = require('path');


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
            return false;
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

        return true;
    }
};


var executer = {
    instance: null,
    initialize: function() {
        var okay = translator.translate();
        if (okay) {
            executer.instance = execute(translator.data);
        }
        return okay;
    },
    execute: function(initialize) {
        var okay = true;
        if (!initialize) {
            okay = executer.initialize();
        }
        if (okay) {
            popup.close();
            $('nav a[data-action]').addClass('disabled');
            executer.instance.execute();
        }
    },
    execute_one: function() {
        if (!executer.instance) {
            executer.initialize();
        }
        executer.instance.execute_one();
    }
};


var editor = {
    highlight: $('.current-line'),
    highlight_line: function() {
        var contents = $('textarea').val();
        var before = contents.substring(0, $('textarea')[0].selectionStart);
        before = before.split(/\r?\n/g);
        $('.line-numbers span').removeClass('current');
        $('.line-numbers span[data-line="' + before.length + '"]')
            .addClass('current');

        var offset = $('.line-numbers span.current').offset().top;
        editor.highlight.css('top', offset - 20 + 'px');
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
            executer.instance.unblock();
        }, 200);
    }
};


var highlighter = {
    initialize: function() {
        hljs.registerLanguage('myassem', function(hljs) {
            return {
                keywords: 'read disp pushi pushv pop mod jmp jl jg jeq add sub '
                    + 'cmp begin end',
                contains: [
                    {
                        className: 'number',
                        begin: /(^| )\d+/
                    }
                ]
            }
        });

        var code = $('pre code');
        var linenumbers = $('.line-numbers');
        $('textarea').on('keydown keyup', function(e) {
            code.text($(this).val());
            hljs.highlightBlock(code[0]);

            linenumbers.empty();
            var lines = $(this).val().split(/\r?\n/g);
            for (var i = 0, l = lines.length; i < l; i++) {
                var line = '<span data-line="' + (i + 1) + '">'
                    + (i + 1) + '</span>';
                linenumbers.append(line);
            }

            editor.highlight_line();
        });
    }
};

highlighter.initialize();


popup.dom.on('submit', function(e) {
    e.preventDefault();
    input = $(this).find('input').val().trim();
    popup.close();
    executer.instance.input(input);
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

$(document).on('disp', function(e) {
    popup.info(e.value);
});

$(document).on('error', function(e) {
    popup.error(e.error);
});

$(document).on('done', function() {
    ui._translation.children().removeClass('highlight');
    $('nav a[data-action]').removeClass('disabled');
    popup.info('Program execution finished.');
});


$('nav').on('click', 'a[data-action]', function(e) {
    e.preventDefault();
    if (!$(this).hasClass('disabled')) {
        ui.reset();
        var action = $(this).data('action');
        if (action === 'file') {
            $('input[type="file"]').trigger('click');
        } else if (action === 'translate') {
            $('main').addClass('mini');
            $('aside section').removeClass('unshown');
            var okay = translator.translate();
            if (okay) {
                var output = prompt('Where do you want to store the output file?',
                    process.env[process.platform === 'win32'
                    ? 'USERPROFILE' : 'HOME']);
                if (output) {
                    var contents = translator.data.translation.join('\n')
                    fs.writeFileSync(output, contents);
                    popup.info('Output file created at: ' + output);
                }
            }
        } else if (action === 'trace') {
            $('main').addClass('mini');
            $('aside section, #trace').removeClass('unshown');
            translator.translate();
        } else if (action === 'execute') {
            $('main').addClass('mini');
            $('aside section').removeClass('unshown');
            executer.execute();
        }
    }
});


$('#trace button[data-action]').on('click', function() {
    var action = $(this).data('action');
    if (action === 'reset') {
        ui.reset(true);
        var okay = translator.translate();
        if (okay) {
            executer.initialize();
        }
    } else if (action === 'run') {
        executer.execute(true);
    } else if (action === 'next') {
        executer.execute_one();
    }
});


$('#popup span').on('click', function() {
    popup.close();
});


$('input[type="file"]').on('change', function() {
    var file = $(this)[0].files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var value = e.target.result;

        $('textarea').val(value);
        translator.data = null;
        ui.reset(true);
        $('input[type="file"]').val('');
        $('main').removeClass('mini');
        $('aside section').addClass('unshown');

        var code = $('pre code');
        var linenumbers = $('.line-numbers');
        code.text(value);
        hljs.highlightBlock(code[0]);

        linenumbers.empty();
        var lines = value.split(/\r?\n/g);
        for (var i = 0, l = lines.length; i < l; i++) {
            var line = '<span data-line="' + (i + 1) + '">'
                + (i + 1) + '</span>';
            linenumbers.append(line);
        }

        editor.highlight_line();
    };
    reader.readAsText(file);
});


$('textarea').on('scroll', function(e) {
    $('.line-numbers, main pre').css('top', -(+e.target.scrollTop) + 'px');
    editor.highlight_line();
});


$('textarea').on('click', function(e) {
    editor.highlight_line();
});
