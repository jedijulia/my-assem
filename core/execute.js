var input = null;

function execute(info) {
    var memory = info.translation;
    var run = true;
    var blocked = false;
    var error = null;
    var program_counter = 0;

    var stack = [];
    var max_stack_size = 5;


    function resolve_code_to_name(code) {
        // should return the string name of the function corresponding to the
        // code in the symbol  table
        for (var name in symbol_table) {
            if (symbol_table.hasOwnProperty(name) && symbol_table[name] == code) {
                return name;
            }
        }
    }

    function begin(params) {
        run = true;
    }

    function end(params) {
        run = false;
    }

    function read(params) {
        if (input) {
            blocked = false;
            var num = parseInt(input)
            if (input.length > 2 || input === NaN) {
                error = "Invalid input.";
                run = false;
                return;
            }
            memory[params] = num;
        } else {
            $(document).trigger({ type: 'askinput', message: 'Enter a number' });
            blocked = true;
        }
    }

    function disp(params) {
        if (memory[params] === undefined) {
            error = "Trying to access variable that is not defined!"
            run = false;
            return;
        }
        alert(memory[params]);
    }

    function pushi(params) {
        if (stack.length === max_stack_size) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        stack.push(params)
    }

    function pushv(params) {
        if (memory[params] === undefined) {
            error = "Trying to access variable that is not defined!"
            run = false;
            return;
        }
        if (stack.length === max_stack_size) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        stack.push(memory[params]);
    }

    function pop(params) {
        if (stack.length === 0) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        var num = stack.pop();
        memory[params] = num;
    }

    function mod(params) {
        var stack_size = stack.length;
        if (stack_size < 2) {
            error = "Null Operand!"
            run = false;
            return;
        }
        if (stack_size === max_stack_size) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        var m = stack[stack_size - 2] % stack[stack_size - 1]
        stack.push(m);
    }

    function jmp(params) {
        program_counter = params;
    }

    function jl(params) {
        var l = stack.length;
        if (l >= 2 && stack[l-1] < stack[l-2]) {
            jmp(params);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function jg(params) {
        var l = stack.length;
        if (l >= 2 && stack[l-1] > stack[l-2]) {
            jmp(params);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function jeq(params) {
        var l = stack.length;
        if (l >= 2 && stack[l-1] == stack[l-2]) {
            jmp(params);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function add() {
        var l = stack.length;
        if (l >= 2) {
            var sum = stack.pop() + stack.pop();
            if (sum <= 99) {
                pushi(sum);
            } else {
                error = "Overflow Error";
            }
        } else {
            error = "Null Operand Error";
        }
    }

    function sub() {
        var l = stack.length;
        if (l >= 2) {
            var diff = stack.pop() - stack.pop();
            if (diff >= 0) {
                pushi(diff);
            } else {
                error = "Overflow Error";
            }
        } else {
            error = "Null Operand Error";
        }
    }

    function cmp() {
        var l = stack.length;
        if (l >= 2) {
            var a = (stack.pop() == stack.pop()) ? 1 : 0;
            pushi(a);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function labeldef() {
        // do nothing :)
    }


    var _t = setInterval(function() {
        if (run) {
            $(document).trigger({ type: 'changedpc', pc: program_counter });
            var command = memory[program_counter];
            var code = command.substring(0, 2);
            var params = parseInt(command.substring(2));
            var prev_pc = program_counter;
            var func = resolve_code_to_name(code);
            eval(func)(params);
            if (!blocked) {
                if (program_counter === prev_pc) {
                    program_counter += 1;
                }
                if (error) {
                    $(document).trigger({ type: 'error', error: error });
                }

                $(document).trigger({ type: 'stack', stack: stack });
            }
        } else {
            clearInterval(_t);
        }
    }, 1000);
}
