var translate = (function() {

    symbol_table = {
        'read': '50',
        'disp': '51',
        'pushi': '52',
        'pushv': '53',
        'pop': '54',
        'mod': '55',
        'jmp': '56',
        'jl': '57',
        'jg': '58',
        'jeq': '59',
        'add': '60',
        'sub': '61',
        'cmp': '62',
        'begin': '63',
        'end': '64',
        'labeldef': '65'
    };

    var twopart_commands = ['read', 'disp', 'pushi', 'pushv', 'pop', 'jmp',
        'jl', 'jg', 'jeq'];
    var onepart_commands = ['mod', 'add', 'sub', 'cmp', 'begin', 'end'];

    var var_table = {};
    var label_table = {};
    var pointer = 30;

    var translation = [];

    function translate(code) {
        translation = [];
        resolve_vars(code);

        var found_end = false;
        for (var i = 0; i < code.length; i++) {
            if (found_end) {
                break;
            }
            if (code[i] === 'end') {
                found_end = true;
            }

            var line = code[i].split(' ');
            if (line.length === 2) {
                translate_twopart_command(line, i);
            } else if (line.length === 1) {
                translate_onepart_command(line, i);
            } else {
                throw new Error('Invalid command at line ' + i + ': ' + line);
            }
        }

        return {'translation': translation, 'var_table': var_table, 'label_table': label_table};
    }

    function addTranslation(translated) {
        if (translation.length <= 30) {
            translation.push(translated);
        } else {
            throw new Error('Out of memory error');
        }
    }

    function translate_onepart_command(command, line_number) {
        var label = command[0];
        if (onepart_commands.indexOf(label) !== -1) { //in list
            var translated = symbol_table[label] + '00';
        }  else {
            var label_location = label_table[label.substring(0, label.length - 1)];
            var translated = symbol_table['labeldef'] + label_location;
        }
        addTranslation(translated);
    }

    function translate_twopart_command(command, line_number) {
        var identifier = ['read', 'disp', 'pushv', 'pop'];
        var loc_identifier = ['jmp', 'jl', 'jg', 'jeq'];
        var value = ['pushi'];

        if (identifier.indexOf(command[0]) !== -1) { //accepts an identifier
            translate_identifier_command(command, line_number);
        } else if (loc_identifier.indexOf(command[0]) !== -1) {
            translate_loc_identifier_command(command, line_number);
        } else if (value.indexOf(command[0]) !== -1) { //not in value either
            translate_value_command(command, line_number);
        } else {
            throw new Error('Invalid command at line ' + line_number + ': ' + command);
        }
    }


    function translate_identifier_command(command, line_number) {
        var translated = symbol_table[command[0]];
        translated += var_table[command[1]];
        addTranslation(translated);
    }

    function translate_loc_identifier_command(command, line_number) {
        var translated = symbol_table[command[0]];
        translated += label_table[command[1]];
        addTranslation(translated);
    }

    function translate_value_command(command, line_number) {
        var translated = symbol_table[command[0]];
        if (command[1].length === 1) {
            translated += '0' + command[1];
        } else if (command[1].length === 2) {
            translated += command[1];
        } else {
            throw new Error('Input too large at line ' + i + ': ' + line);
        }
        addTranslation(translated);
    }


    function resolve_vars(code) {
        if (code[0] !== 'begin') {
            throw new Error('Misplaced begin, not found at line 1');
        }
        for (var i = 0; i < code.length; i++) {
            var line = code[i].split(' ');
            if (i !== 0 && line[0] === 'begin') {
                throw new Error('Misplaced begin at line ' + i);
            }
            if (line.length === 2) {
                get_vars_twopart_command(line, i);
            } else if (line.length === 1) {
                get_vars_onepart_command(line, i);
            } else {
                throw new Error('Invalid command at line ' + i + ': ' + line);
            }
        }
    }

    function get_vars_onepart_command(command, line_number) {
        var label = command[0];
        if (onepart_commands.indexOf(label) === -1) { //not in list
            if (label.length > 1 && (label[label.length - 1] === ':')) {
                var label_mod = label.substring(0, label.length - 1);
                if (!label_table.hasOwnProperty(label_mod)) {
                    label_table[label_mod] = line_number;
                }
            } else {
                throw new Error('Invalid command at line ' + line_number + ': ' + command);
            }
        }
    }

    function get_vars_twopart_command(command, line_number) {
        var identifier = ['read', 'disp', 'pushv', 'pop'];
        var loc_identifier = ['jmp', 'jl', 'jg', 'jeq'];
        var value = ['pushi'];

        if (identifier.indexOf(command[0]) !== -1) { //accepts an identifier
            get_vars_identifier_command(command, line_number);
        } else if (loc_identifier.indexOf(command[0]) !== -1) {
            get_vars_loc_identifier_command(command, line_number);
        } else if (value.indexOf(command[0]) === -1) { //not in value either
            throw new Error('Invalid command at line ' + line_number + ': ' + command);
        }
    }

    function get_vars_identifier_command(command, line_number) {
        var identifier = command[1];

        if (!identifier.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) {
            throw new Error('Invalid identifier at line ' + line_number + ': ' + command);
        }
        //identifier not yet found in the table
        if (!var_table.hasOwnProperty(identifier)) {
            var_table[identifier] = pointer;
            pointer++;
        }
    }

    function get_vars_loc_identifier_command(command, line_number) {
        var loc_identifier = command[1];

        if (!loc_identifier.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) {
            throw new Error('Invalid identifier at line ' + line_number + ': ' + command);
        }
    }

    return translate;
})();

// commands = [
//     'begin',
//     'read N',
//     'pushv N',
//     'pushi 2',
//     'mod',
//     'pushi 0',
//     'jeq even',
//     'pushi 0',
//     'pop ans',
//     'jmp stop',
//     'even:',
//     'pushi 1',
//     'pop ans',
//     'stop:',
//     'disp ans',
//     'end'
// ];

// console.log(translate(commands));
